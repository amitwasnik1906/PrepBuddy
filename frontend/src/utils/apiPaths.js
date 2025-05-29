export const BASE_URL = 'http://localhost:8000';

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
        VERIFY_EMAIL: "/api/auth/verify-email",
        RESEND_VERIFY_EMAIL: "/api/auth/resend-verify-token"
    },

    IMAGE:{
        UPLOAD_IMAGE : "/api/auth/upload-image"
    },

    SESSION:{
        CREATE: "/api/session/create",
        GET_ALL: "/api/session/my-sessions",
        GET_ONE: (id) => `/api/session/${id}`,
        DELETE: (id) => `/api/session/${id}`,
    },

    QUESTION:{
        ADD_TO_SESSION: "/api/question/add",
        PIN: (id) => `/api/question/${id}/pin`,
        UPDATE_NOTE: (id) => `/api/question/${id}/note`
    },

    AI:{
        GENERATE_QUESTION: "/api/ai/generate-questions",
        GENERATE_EXPLAINATION: "/api/ai/generate-explaination",
    }

}