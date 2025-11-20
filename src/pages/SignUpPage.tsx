import { useForm, FormProvider, Controller } from "react-hook-form";
import type { SignupForm } from "../types/user";
import type { PageType } from "../types/general";
import { useAuth } from "../components/auth/AuthContext";
import ProfileImagePicker from "../components/ProfileImagePicker";
import AddressForm from "../components/AddressForm";
import "./AuthPage.css";
import { useNotification } from "../components/notification/NotificationContext";

interface SignupPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const SignupPage = ({ navigate }: SignupPageProps) => {
  const { addNotification } = useNotification();
  const { signup } = useAuth();

  const handleSuccess = (username: string) => {
    addNotification({
      type: "success",
      title: "Conta criada!",
      message: `Bem vindo(a), ${username}`,
      duration: 3000,
    });
  };

  const handleError = (erro: string) => {
    addNotification({
      type: "error",
      title: "Erro ao criar conta",
      message: erro,
      duration: 3000,
    });
  };

  const methods = useForm<SignupForm>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      age: 0,
      perfilImageUrl: null,
      address: {
        country: "",
        state: "",
        city: "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (signupForm: SignupForm) => {
    const { ok, error } = await signup(signupForm);

    if (ok) {
      handleSuccess(signupForm.username);
      navigate("login");
    }

    if (error) {
      try {
        const message: string = error.response.data.error
        handleError(message)
      } catch (err) {
        handleError('Não foi possível criar sua conta, verifique as informações.')
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign Up</h1>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              placeholder="username"
              {...register("username", { required: true })}
            />
            {errors.username && <div className="error-message">Required</div>}

            <input
              placeholder="email"
              type="email"
              {...register("email", { required: true })}
            />
            {errors.email && <div className="error-message">Required</div>}

            <input
              placeholder="password"
              type="password"
              {...register("password", { required: true })}
            />
            {errors.password && <div className="error-message">Required</div>}

            <input
              placeholder="age"
              type="number"
              {...register("age", { required: true, valueAsNumber: true })}
            />
            {errors.age && <div className="error-message">Required</div>}

            <AddressForm />

            <h3>Profile Image</h3>
            <Controller
              control={control}
              name="perfilImageUrl"
              render={({ field }) => (
                <ProfileImagePicker
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <button type="submit">Sign Up</button>
          </form>
        </FormProvider>

        <p>
          Already have an account?{" "}
          <a onClick={() => navigate("login")}>Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
