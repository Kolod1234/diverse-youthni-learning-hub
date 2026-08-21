/**
 * Base44 side of the Diverse Youth Virtual Science Centre bridge.
 *
 * This is the cross-origin counterpart of WebHost/src/bridge.js. The original
 * assumed Unity was instantiated in the same document, so it could call
 * `unityInstance.SendMessage(...)` directly. The Unity WebGL build is ~134 MB
 * and is hosted on its own origin, so it now lives in an iframe and cannot be
 * reached that way: the parent posts commands to the iframe, and a small relay
 * shipped alongside the Unity build turns them into SendMessage calls.
 *
 * The wire protocol Unity emits is unchanged, so no C# or .jslib edits are
 * needed - only the transport differs.
 *
 *   Unity  -> relay -> parent :  science-centre.ready
 *                               science-centre.request-launch
 *                               science-centre.department-changed
 *                               science-centre.navigation-failed
 *                               science-centre.checkpoint
 *
 *   parent -> relay -> Unity  :  science-centre.command { method, payload }
 */

export const PROTOCOL_VERSION = '1.0';
const BRIDGE_OBJECT = 'Base44Bridge';

/**
 * Reduce a URL to its origin, so an allowlist entry can be written either way
 * ("https://host" or "https://host/unity/index.html").
 */
export function originOf(url) {
  try {
    return new URL(url, window.location.href).origin;
  } catch {
    return '';
  }
}

/**
 * @param {object}   options
 * @param {Window}   options.targetWindow   iframe.contentWindow hosting Unity
 * @param {string}   options.targetOrigin   exact origin of that iframe
 * @param {object}   options.launchContext  protocol 1.0 launch context
 * @param {Window}   [options.windowObject] listening window (for tests)
 */
export function createScienceCentreBridge({
  windowObject = window,
  targetWindow,
  targetOrigin,
  launchContext,
  onReady = () => {},
  onDepartmentChanged = () => {},
  onCheckpoint = () => {},
  onNavigationFailed = () => {},
}) {
  if (!windowObject || typeof windowObject.addEventListener !== 'function') {
    throw new TypeError('A browser window is required.');
  }
  if (!targetWindow || typeof targetWindow.postMessage !== 'function') {
    throw new TypeError('A target window hosting the Science Centre is required.');
  }
  if (!targetOrigin || targetOrigin === 'null' || targetOrigin === '*') {
    // A wildcard would let any page both receive the learner's launch context
    // and forge checkpoint traffic, so it is refused outright.
    throw new TypeError('An explicit target origin is required.');
  }
  if (!launchContext || launchContext.protocolVersion !== PROTOCOL_VERSION) {
    throw new TypeError('A version 1.0 launch context is required.');
  }

  let launchForwarded = false;
  let disposed = false;

  function send(method, payload) {
    if (disposed) return;
    targetWindow.postMessage(
      { version: PROTOCOL_VERSION, type: 'science-centre.command', method, payload },
      targetOrigin,
    );
  }

  function onMessage(event) {
    // Same checks as the same-origin bridge, but against the Unity host's
    // origin rather than our own, plus a source check so that only the frame
    // we actually embedded can talk to us.
    if (event.origin !== targetOrigin) return;
    if (event.source !== targetWindow) return;

    const message = event.data;
    if (!message || message.version !== PROTOCOL_VERSION || typeof message.type !== 'string') return;

    switch (message.type) {
      case 'science-centre.ready':
        onReady();
        break;

      case 'science-centre.request-launch':
        if (!launchForwarded) {
          launchForwarded = true;
          send('ReceiveLaunchContext', launchContext);
        }
        break;

      case 'science-centre.department-changed':
        onDepartmentChanged(message.department);
        break;

      case 'science-centre.navigation-failed':
        onNavigationFailed(
          typeof message.error === 'string' ? message.error : 'Department navigation failed.',
        );
        break;

      case 'science-centre.checkpoint':
        if (
          Number.isSafeInteger(message.sequenceNumber) &&
          message.sequenceNumber > 0 &&
          typeof message.checkpointJson === 'string' &&
          message.checkpointJson.length > 0
        ) {
          onCheckpoint(message.checkpointJson);
          send('ReceiveCheckpointAcknowledgement', { sequenceNumber: message.sequenceNumber });
        }
        break;

      default:
        break;
    }
  }

  windowObject.addEventListener('message', onMessage);

  return {
    /** Ask Unity to load a department scene by name, e.g. "Chemistry". */
    requestDepartment(name) {
      send('RequestDepartment', name);
    },
    /** Send the learner back to the entrance atrium. */
    returnToAtrium() {
      send('RequestAtrium', '');
    },
    dispose() {
      disposed = true;
      windowObject.removeEventListener('message', onMessage);
    },
  };
}
