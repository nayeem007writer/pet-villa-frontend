export const setAuthToken = (token) => {
    localStorage.setItem("accessToken", token);
  };
  
  export const setTokens = (data) => {
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("permissionToken", data.permissionToken);
    localStorage.setItem("userId", data.user.id);
  };
  
  export const isAuthenticated = () => {
    return !!localStorage.getItem("accessToken");
  };
  
  export const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };
  
  

  export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("permissionToken");
    localStorage.removeItem("userId");
  };
  