
//EXCHANGE TYPES
export const DIRECT_EXCHANGE_TYPE = 'direct'
export const FANOUT_EXCHANGE_TYPE = 'fanout'


//EXCHANGE NAMES
export const SUPER_ADMIN_EXCHANGE = 'superAdminExchange'
export const STUDENT_BULK_UPLOAD = 'studentBulkUpload'

//QUEUE NAMES
export const CREATE_ADMIN_QUEUE = 'createAdmin'
export const UPDATE_ADMIN_QUEUE = 'updateAdmin'
export const DEACTIVATE_ADMIN_QUEUE = 'deactivateAdmin'
export const ACTIVATE_ADMIN_QUEUE = 'activateAdmin'

//ROUTUNG KEYS
export const CREATE_ADMIN_KEY = 'createAdminKey'
export const UPDATE_ADMIN_KEY = 'updateAdminKey'
export const DEACTIVATE_ADMIN_KEY = 'deactivateAdminKey'
export const ACTIVATE_ADMIN_KEY = 'activateAdminKey'

//FANOUT EXCHANGE BOUND QUEUES
export const FANOUT_STUDENT_BULK_UPLOAD_ADMIN_QUEUE = 'fanoutStudentBulkUploadAdmin'
export const FANOUT_STUDENT_BULK_UPLOAD_STUDENT_QUEUE = 'fanoutStudentBulkUploadStudent'