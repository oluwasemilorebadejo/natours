/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "post",
      url: "/api/v1/users/login",
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in Successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1200);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "get",
      url: "api/v1/users/logout",
    });

    if (res.data.status === "success") {
      window.setTimeout(() => {
        location.replace("/login");
      }, 1200);
      // location.reload(true); // loads a fresh page from the server
    }
  } catch (err) {
    showAlert("error", "Error logging out! Pls try again");
  }
};
