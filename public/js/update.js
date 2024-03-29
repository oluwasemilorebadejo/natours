/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updateMyPassword"
        : "/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });

    if (res.data.status === "success") {
      showAlert(
        "success",
        `User ${type[0].toUpperCase()}${type.slice(1)} updated successfully!`
      );
      window.setTimeout(() => {
        location.assign("/me");
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
