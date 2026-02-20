// Role-based permissions configuration
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  CONTENT_CREATOR: 'content_creator',
  LEARNER: 'learner',
  COORDINATOR: 'coordinator'
};

// Granular permissions
export const PERMISSIONS = {
  // Course Management
  CREATE_COURSE: 'create_course',
  EDIT_COURSE: 'edit_course',
  DELETE_COURSE: 'delete_course',
  PUBLISH_COURSE: 'publish_course',
  VIEW_ALL_COURSES: 'view_all_courses',
  
  // Content Creation
  CREATE_LESSON: 'create_lesson',
  EDIT_LESSON: 'edit_lesson',
  DELETE_LESSON: 'delete_lesson',
  CREATE_QUIZ: 'create_quiz',
  EDIT_QUIZ: 'edit_quiz',
  CREATE_SIMULATION: 'create_simulation',
  
  // Student Management
  VIEW_STUDENTS: 'view_students',
  MANAGE_ENROLLMENTS: 'manage_enrollments',
  VIEW_STUDENT_PROGRESS: 'view_student_progress',
  GRADE_ASSIGNMENTS: 'grade_assignments',
  SEND_MESSAGES: 'send_messages',
  
  // Analytics & Reporting
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  VIEW_REPORTS: 'view_reports',
  
  // Administrative
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_SETTINGS: 'manage_settings',
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
  MANAGE_INTEGRATIONS: 'manage_integrations',
  
  // Session Management
  CREATE_SESSION: 'create_session',
  HOST_SESSION: 'host_session',
  RECORD_SESSION: 'record_session',
  
  // Library & Resources
  UPLOAD_RESOURCES: 'upload_resources',
  MANAGE_LIBRARY: 'manage_library',
  
  // Learning
  ENROLL_COURSES: 'enroll_courses',
  ACCESS_LESSONS: 'access_lessons',
  TAKE_QUIZZES: 'take_quizzes',
  SUBMIT_ASSIGNMENTS: 'submit_assignments',
  VIEW_OWN_PROGRESS: 'view_own_progress'
};

// Role to permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.INSTRUCTOR]: [
    // Course & Content Management
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.EDIT_COURSE,
    PERMISSIONS.DELETE_COURSE,
    PERMISSIONS.PUBLISH_COURSE,
    PERMISSIONS.VIEW_ALL_COURSES,
    PERMISSIONS.CREATE_LESSON,
    PERMISSIONS.EDIT_LESSON,
    PERMISSIONS.DELETE_LESSON,
    PERMISSIONS.CREATE_QUIZ,
    PERMISSIONS.EDIT_QUIZ,
    PERMISSIONS.CREATE_SIMULATION,
    
    // Student Management
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_ENROLLMENTS,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
    PERMISSIONS.GRADE_ASSIGNMENTS,
    PERMISSIONS.SEND_MESSAGES,
    
    // Analytics
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    
    // Sessions
    PERMISSIONS.CREATE_SESSION,
    PERMISSIONS.HOST_SESSION,
    PERMISSIONS.RECORD_SESSION,
    
    // Library
    PERMISSIONS.UPLOAD_RESOURCES,
    
    // Learning (instructors can also learn)
    PERMISSIONS.ENROLL_COURSES,
    PERMISSIONS.ACCESS_LESSONS,
    PERMISSIONS.VIEW_OWN_PROGRESS
  ],
  
  [ROLES.CONTENT_CREATOR]: [
    // Content Creation Only
    PERMISSIONS.CREATE_LESSON,
    PERMISSIONS.EDIT_LESSON,
    PERMISSIONS.CREATE_QUIZ,
    PERMISSIONS.EDIT_QUIZ,
    PERMISSIONS.CREATE_SIMULATION,
    PERMISSIONS.UPLOAD_RESOURCES,
    
    // Limited course access
    PERMISSIONS.VIEW_ALL_COURSES,
    
    // Learning capabilities
    PERMISSIONS.ENROLL_COURSES,
    PERMISSIONS.ACCESS_LESSONS,
    PERMISSIONS.TAKE_QUIZZES,
    PERMISSIONS.VIEW_OWN_PROGRESS
  ],
  
  [ROLES.LEARNER]: [
    // Basic learning permissions
    PERMISSIONS.ENROLL_COURSES,
    PERMISSIONS.ACCESS_LESSONS,
    PERMISSIONS.TAKE_QUIZZES,
    PERMISSIONS.SUBMIT_ASSIGNMENTS,
    PERMISSIONS.VIEW_OWN_PROGRESS
  ],
  
  [ROLES.COORDINATOR]: [
    // Program management
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.VIEW_ANALYTICS,
    
    // Learning capabilities
    PERMISSIONS.ENROLL_COURSES,
    PERMISSIONS.ACCESS_LESSONS,
    PERMISSIONS.VIEW_OWN_PROGRESS
  ]
};

// Helper function to check if a role has a permission
export function hasPermission(role, permission, customPermissions = []) {
  if (!role) return false;
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  if (rolePermissions.includes(permission)) return true;
  
  // Check custom permissions
  if (customPermissions && customPermissions.includes(permission)) return true;
  
  return false;
}

// Helper function to get all permissions for a role
export function getPermissions(role, customPermissions = []) {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return [...new Set([...rolePermissions, ...(customPermissions || [])])];
}

// Role hierarchy (for fallback checks)
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 5,
  [ROLES.INSTRUCTOR]: 4,
  [ROLES.CONTENT_CREATOR]: 3,
  [ROLES.COORDINATOR]: 2,
  [ROLES.LEARNER]: 1
};

// Check if role is at or above a certain level
export function hasRoleLevel(userRole, requiredRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}