
import { Metadata } from "next";
import LoginPage from "./Login";
export const metadata: Metadata = {
    title: "Bank Sampah | Login",
};
export default function Login() {
    return (
        //    <Login/>
        <>
           <LoginPage/>
        </>
    )
}
