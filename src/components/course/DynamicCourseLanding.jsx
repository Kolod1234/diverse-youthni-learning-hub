import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Star, Users, Clock, Award, BookOpen, CheckCircle } from 'lucide-react';

export default function DynamicCourseLanding({ course, enrollment }) {
  const { data: customSections = [] } = useQuery({
    queryKey: ['course-sections', course.id],
    queryFn: () => base44.entities.PageSection.filter({ 
      course_id: course.id, 
      is_active: true 
    }, 'order', 50),
    initialData: []
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['course-reviews', course.id],
    queryFn: () => base44.entities.Review.filter({ course_id: course.id }, '-created_date', 100)
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', course.id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: course.id }, 'order', 100)
  });

  const { data: relatedCourses = [] } = useQuery({
    queryKey: ['related-courses', course.category],
    queryFn: () => base44.entities.Course.filter({ category: course.category }, '-created_date', 4),
    enabled: !!course.category
  });

  const renderSection = (section) => {
    switch (section.section_type) {
      case 'text_block':
        return <TextBlockSection section={section} />;
      case 'feature_section':
        return <FeaturesSection section={section} course={course} />;
      case 'cta_banner':
        return <CTABanner section={section} enrollment={enrollment} />;
      case 'testimonial':
        return <TestimonialSection section={section} reviews={allReviews} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-12">
      {customSections.map((section) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {renderSection(section)}
        </motion.div>
      ))}

      {relatedCourses.length > 0 && (
        <RelatedCoursesSection courses={relatedCourses.filter(c => c.id !== course.id)} />
      )}
    </div>
  );
}

function TextBlockSection({ section }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border">
      {section.title && <h2 className="text-3xl font-bold mb-4">{section.title}</h2>}
      {section.subtitle && <p className="text-xl text-gray-600 mb-6">{section.subtitle}</p>}
      {section.content && (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
      )}
    </div>
  );
}

function FeaturesSection({ section, course }) {
  const features = [
    { icon: BookOpen, text: `${course.total_lessons || 0} Lessons`, color: 'blue' },
    { icon: Clock, text: `${course.duration_hours || 0} Hours`, color: 'green' },
    { icon: Award, text: 'Certificate Included', color: 'purple' },
    { icon: Users, text: `${course.enrolled_count || 0} Students`, color: 'orange' }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
      {section.title && <h2 className="text-3xl font-bold mb-8 text-center">{section.title}</h2>}
      <div className="grid md:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Icon className={`w-12 h-12 mx-auto mb-3 text-${feature.color}-600`} />
              <p className="font-semibold">{feature.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CTABanner({ section, enrollment }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white">
      <h2 className="text-4xl font-bold mb-4">{section.title || 'Ready to Start Learning?'}</h2>
      <p className="text-xl mb-8">{section.content || 'Join thousands of students already enrolled'}</p>
      {!enrollment && (
        <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all">
          {section.cta_text || 'Enroll Now'}
        </button>
      )}
    </div>
  );
}

function TestimonialSection({ section, reviews }) {
  const topReviews = reviews.filter(r => r.rating >= 4 && r.comment).slice(0, 3);

  return (
    <div className="bg-gray-50 rounded-2xl p-8">
      <h2 className="text-3xl font-bold mb-8 text-center">{section.title || 'Student Reviews'}</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {topReviews.map((review, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-gray-700 mb-4">"{review.comment}"</p>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {review.user_name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{review.user_name}</p>
                <p className="text-xs text-gray-500">Verified Student</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedCoursesSection({ courses }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Related Courses</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.slice(0, 3).map((course) => (
          <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}