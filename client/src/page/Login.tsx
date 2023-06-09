import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store";
import { login } from "../store/Reducers/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "username":
        setUsername(e.target.value);
        break;
      case "password":
        setPassword(e.target.value);
        break;
    }
  };

  // Send a request to login
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: username, password: password }),
        }
      );

      const result = await response.json();

      if (result.success) {
        dispatch(login({ ...result }));
        navigate("/");
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center">
      <h1>Login</h1>
      <form className="w-full max-w-md" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 mb-2">
          <label>Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleChange}
            required
          ></input>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <label>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
          ></input>
        </div>
        <div className="flex justify-center">
          <button className="bg-blue-500 hover:bg-blue-700" type="submit">
            Login
          </button>
        </div>
      </form>
      <p className="mt-8">
        Don't have an account?{" "}
        <Link
          className="text-blue-500 hover:text-blue-700 font-bold"
          to="/register"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
