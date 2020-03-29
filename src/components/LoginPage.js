import React from 'react';
import { Formik, Form, Field } from 'formik';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/authContext';
import { ipcRenderer } from 'electron';

export default function LoginPage() {
  const [username, setUsername] = useLocalStorage('username', '');
  const [auth, dispatch] = useAuth();

  const initialValues = {
    username,
    password: '',
  };

  function handleSubmit(data) {
    setUsername(data.username);
    dispatch({ type: 'LOGIN_START' });
    ipcRenderer.send('auth', { type: 'DO_LOGIN', payload: data });
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {() => {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-lg w-full">
              <div>
                <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
                  Log in to your Minecraft account
                </h2>
              </div>
              <Form className="mt-8">
                <div className="rounded-md shadow-sm">
                  <div>
                    <Field
                      aria-label="Username"
                      name="username"
                      type="username"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10"
                      placeholder="Username"
                    />
                  </div>
                  <div className="-mt-px">
                    <Field
                      aria-label="Password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10"
                      placeholder="Password"
                    />
                  </div>
                </div>

                {auth.error && (
                  <p className="mt-4 text-red-600">{auth.error}</p>
                )}

                <div className="mt-6">
                  <button
                    disabled={auth.isLoggingIn}
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                  >
                    Log in
                  </button>
                </div>
              </Form>
            </div>
          </div>
        );
      }}
    </Formik>
  );
}
