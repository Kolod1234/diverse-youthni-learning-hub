import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Creates presentations on the organisation's Google account, so staff only.
    if (user.role !== 'admin' && !user.is_tutor && !(user.is_coordinator && !user.coordinator_banned)) {
      return Response.json({ error: 'Only staff can create event slides' }, { status: 403 });
    }

    const { eventTitle, eventDate, eventLocation, description, agenda, organizer } = await req.json();

    if (!eventTitle) {
      return Response.json({ error: 'Event title is required' }, { status: 400 });
    }

    // Get Google Slides access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

    // Create a new presentation
    const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `${eventTitle} - Community Event`
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create presentation: ${error}`);
    }

    const presentation = await createResponse.json();
    const presentationId = presentation.presentationId;

    // Build requests to add slides and content
    const requests = [];

    // Slide 1: Title Slide (already exists, just update it)
    const titleSlideId = presentation.slides[0].objectId;
    requests.push({
      deleteObject: {
        objectId: presentation.slides[0].pageElements[0].objectId
      }
    });

    requests.push({
      createShape: {
        objectId: 'titleBox',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: titleSlideId,
          size: {
            width: { magnitude: 600, unit: 'PT' },
            height: { magnitude: 100, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 150,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: 'titleBox',
        text: eventTitle
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: 'titleBox',
        style: {
          fontSize: { magnitude: 48, unit: 'PT' },
          bold: true,
          foregroundColor: {
            opaqueColor: { rgbColor: { red: 0.2, green: 0.3, blue: 0.8 } }
          }
        },
        fields: 'fontSize,bold,foregroundColor'
      }
    });

    // Add subtitle with date and location
    if (eventDate || eventLocation) {
      requests.push({
        createShape: {
          objectId: 'subtitleBox',
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: titleSlideId,
            size: {
              width: { magnitude: 600, unit: 'PT' },
              height: { magnitude: 50, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 270,
              unit: 'PT'
            }
          }
        }
      });

      const subtitle = [eventDate, eventLocation].filter(Boolean).join(' • ');
      requests.push({
        insertText: {
          objectId: 'subtitleBox',
          text: subtitle
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: 'subtitleBox',
          style: {
            fontSize: { magnitude: 24, unit: 'PT' },
            foregroundColor: {
              opaqueColor: { rgbColor: { red: 0.4, green: 0.4, blue: 0.4 } }
            }
          },
          fields: 'fontSize,foregroundColor'
        }
      });
    }

    // Slide 2: Event Details
    if (description) {
      requests.push({
        createSlide: {
          objectId: 'detailsSlide',
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' }
        }
      });

      requests.push({
        createShape: {
          objectId: 'detailsTitle',
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: 'detailsSlide',
            size: {
              width: { magnitude: 600, unit: 'PT' },
              height: { magnitude: 60, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 50,
              unit: 'PT'
            }
          }
        }
      });

      requests.push({
        insertText: {
          objectId: 'detailsTitle',
          text: 'About This Event'
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: 'detailsTitle',
          style: {
            fontSize: { magnitude: 36, unit: 'PT' },
            bold: true
          },
          fields: 'fontSize,bold'
        }
      });

      requests.push({
        createShape: {
          objectId: 'detailsBody',
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: 'detailsSlide',
            size: {
              width: { magnitude: 600, unit: 'PT' },
              height: { magnitude: 250, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 130,
              unit: 'PT'
            }
          }
        }
      });

      requests.push({
        insertText: {
          objectId: 'detailsBody',
          text: description
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: 'detailsBody',
          style: {
            fontSize: { magnitude: 18, unit: 'PT' }
          },
          fields: 'fontSize'
        }
      });
    }

    // Slide 3: Agenda
    if (agenda && agenda.length > 0) {
      requests.push({
        createSlide: {
          objectId: 'agendaSlide',
          slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' }
        }
      });

      requests.push({
        createShape: {
          objectId: 'agendaTitle',
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: 'agendaSlide',
            size: {
              width: { magnitude: 600, unit: 'PT' },
              height: { magnitude: 60, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 50,
              unit: 'PT'
            }
          }
        }
      });

      requests.push({
        insertText: {
          objectId: 'agendaTitle',
          text: 'Agenda'
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: 'agendaTitle',
          style: {
            fontSize: { magnitude: 36, unit: 'PT' },
            bold: true
          },
          fields: 'fontSize,bold'
        }
      });

      const agendaText = agenda.map((item, i) => `${i + 1}. ${item}`).join('\n\n');
      
      requests.push({
        createShape: {
          objectId: 'agendaBody',
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: 'agendaSlide',
            size: {
              width: { magnitude: 600, unit: 'PT' },
              height: { magnitude: 250, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 130,
              unit: 'PT'
            }
          }
        }
      });

      requests.push({
        insertText: {
          objectId: 'agendaBody',
          text: agendaText
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: 'agendaBody',
          style: {
            fontSize: { magnitude: 18, unit: 'PT' }
          },
          fields: 'fontSize'
        }
      });
    }

    // Slide 4: Thank You
    requests.push({
      createSlide: {
        objectId: 'thanksSlide',
        slideLayoutReference: { predefinedLayout: 'TITLE_ONLY' }
      }
    });

    requests.push({
      createShape: {
        objectId: 'thanksTitle',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: 'thanksSlide',
          size: {
            width: { magnitude: 600, unit: 'PT' },
            height: { magnitude: 100, unit: 'PT' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 150,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: 'thanksTitle',
        text: 'Thank You!'
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: 'thanksTitle',
        style: {
          fontSize: { magnitude: 48, unit: 'PT' },
          bold: true,
          foregroundColor: {
            opaqueColor: { rgbColor: { red: 0.2, green: 0.3, blue: 0.8 } }
          }
        },
        fields: 'fontSize,bold,foregroundColor'
      }
    });

    if (organizer) {
      requests.push({
        createShape: {
          objectId: 'organizerBox',
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: 'thanksSlide',
            size: {
              width: { magnitude: 600, unit: 'PT' },
              height: { magnitude: 50, unit: 'PT' }
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 270,
              unit: 'PT'
            }
          }
        }
      });

      requests.push({
        insertText: {
          objectId: 'organizerBox',
          text: `Organized by ${organizer}`
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: 'organizerBox',
          style: {
            fontSize: { magnitude: 20, unit: 'PT' },
            foregroundColor: {
              opaqueColor: { rgbColor: { red: 0.4, green: 0.4, blue: 0.4 } }
            }
          },
          fields: 'fontSize,foregroundColor'
        }
      });
    }

    // Execute all requests
    const updateResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests })
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update presentation: ${error}`);
    }

    return Response.json({
      success: true,
      presentationId,
      presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`
    });

  } catch (error) {
    console.error('Error creating community event slides:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});