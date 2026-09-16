export default function QuestionSourceImage({ file }) {
  if (file?.type !== "image" || (!file.preview && !file.url)) return null;

  return (
    <figure className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <img
        src={file.preview || file.url}
        alt="Uploaded question diagram used by the AI solver"
        className="mx-auto max-h-96 w-full rounded-lg object-contain"
      />
      <figcaption className="mt-2 text-xs text-gray-500">
        Original uploaded question diagram
      </figcaption>
    </figure>
  );
}