export const setSession = (user: any) => {
    localStorage.setItem("kodingc_user", JSON.stringify(user));
};

export const getSession = () => {
    const userStr = localStorage.getItem("kodingc_user");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error("Failed to parse user session", e);
        return null;
    }
};

export const clearSession = () => {
    localStorage.removeItem("kodingc_user");
};
