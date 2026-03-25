import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
        }

        const { file_url } = await req.json();

        if (!file_url) {
            return Response.json({ error: 'file_url is required' }, { status: 400 });
        }

        // Extract course data from uploaded CSV/Excel
        const extractedData = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
            file_url: file_url,
            json_schema: {
                type: "object",
                properties: {
                    courses: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                instructor: { type: "string" },
                                category: { type: "string" },
                                level: { type: "string" },
                                duration_hours: { type: "number" },
                                total_lessons: { type: "number" },
                                price: { type: "number" }
                            },
                            required: ["title", "description", "category"]
                        }
                    }
                }
            }
        });

        if (extractedData.status === 'error') {
            return Response.json({ 
                error: 'Failed to extract data', 
                details: extractedData.details 
            }, { status: 400 });
        }

        const courses = extractedData.output.courses || extractedData.output;

        // Bulk create courses
        const createdCourses = [];
        for (const courseData of courses) {
            const course = await base44.asServiceRole.entities.Course.create({
                title: courseData.title,
                description: courseData.description,
                instructor: courseData.instructor || 'Staff',
                category: courseData.category,
                level: courseData.level || 'beginner',
                duration_hours: courseData.duration_hours || 10,
                total_lessons: courseData.total_lessons || 10,
                price: courseData.price || 0,
                rating: 0,
                enrolled_count: 0,
                is_featured: false
            });
            createdCourses.push(course);
        }

        return Response.json({ 
            success: true, 
            message: `Successfully imported ${createdCourses.length} courses`,
            courses: createdCourses
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});