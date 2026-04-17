export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
export const CSRF_COOKIE = "csrf_token";

export const SALT_ROUNDS = 12;

export const LOGIN_MAX = 5;
export const LOGIN_LOCK_TIMEOUT = 15 * 60 * 1000;

export const PERMISSIONS: Record<string, string[]> = {
    admin:  ['createPost', 'viewPost', 'updatePost', 'deletePost', 'listPosts'],
    editor: ['createPost', 'viewPost', 'updatePost', 'deletePost', 'listPosts'],
    viewer: ['viewPost', 'listPosts'],
};