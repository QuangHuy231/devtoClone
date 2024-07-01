import React, { useContext, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { AuthContext } from "../../context/auth";
import { useHttpClient } from "../../hooks/useHttpClient";
import useForm from "../../hooks/useForm";
import { loginForm, signupForm } from "../../utils/formConfig";
import { appendData } from "../../utils";
import Welcome from "../../components/Auth/Welcome";
import "./Auth.css";
import ErrorModal from "../../components/Modal/ErrorModal";
import { AiFillGithub } from "react-icons/ai";

const Auth = ({ newUser }) => {
  const { renderFormInputs, renderFormValues, isFormValid, setForm } =
    useForm(signupForm);

  useEffect(() => {
    if (!newUser) {
      setForm(loginForm);
    } else {
      setForm(signupForm);
    }
  }, [newUser, setForm]);

  const formValues = renderFormValues();
  const formInputs = renderFormInputs();

  const { login } = useContext(AuthContext);
  const history = useHistory();

  const { sendReq, error, clearError } = useHttpClient();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    if (code && localStorage.getItem("userData") === null) {
      handleGithubAuth({
        code,
      });
    }
  }, []);
  const loginWithGithub = async () => {
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`
    );
  };

  const handleGithubAuth = async (githubData) => {
    const responseData = await sendReq(
      `${process.env.REACT_APP_BASE_URL}/user/login-with-github`,
      "POST",
      JSON.stringify(githubData),
      {
        "Content-Type": "application/json", //inform backend the type of data being sent
      }
    );

    const user = {
      ...responseData,
      token: responseData.token,
    };
    login(user); //log the user in
    history.push("/");
  };
  const handleAuthSubmit = async (evt) => {
    evt.preventDefault();
    try {
      let responseData;
      if (newUser) {
        const formData = appendData(formValues);
        responseData = await sendReq(
          `${process.env.REACT_APP_BASE_URL}/user/signup`,
          "POST",
          formData
        );
      } else {
        responseData = await sendReq(
          `${process.env.REACT_APP_BASE_URL}/user/login`,
          "POST",
          JSON.stringify(formValues),
          {
            "Content-Type": "application/json",
          }
        );
      }
      login(responseData);
      history.push("/");
    } catch (err) {}
  };

  return (
    <>
      <ErrorModal error={error} onClose={clearError} />
      <div className="container container-auth">
        <Welcome />
        <div className="auth__social">
          <button className="btn btn__social btn--gh" onClick={loginWithGithub}>
            <i>
              <AiFillGithub />
            </i>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <form className="form__auth">
          <div className="form__options">
            <h2>
              {newUser
                ? "Create a New Account"
                : "Log in using an Existing Account"}
            </h2>
            {formInputs}

            <button
              onClick={handleAuthSubmit}
              className="btn btn__auth btn__auth--mode"
              disabled={!isFormValid()}
            >
              {newUser ? "Create account" : "Login"}
            </button>
            <Link
              className="btn btn__auth btn__auth--switch"
              to={newUser ? "/auth" : "/auth/new-user"}
            >
              {newUser ? "Login" : "Create account"}
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Auth;
