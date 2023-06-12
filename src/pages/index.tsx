import Image from 'next/image'
import { Inter } from 'next/font/google'
import jwtDecode from "jwt-decode";
import { getAuth, signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import {auth, provider} from "../FirebaseConfig"
import { useEffect, useState } from 'react';
import axios from 'axios';
const inter = Inter({ subsets: ['latin'] })
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<any>(null);
  const [isLogger, setIsLoger] = useState(false)
  const [app, setApp] = useState<any>()
  const handleLogout = () => {
    localStorage.setItem("token", "")
    setIsLoger(false)
  }

  const handleLoginFaceBook = () => {
    signInWithPopup(auth, provider)
      .then((res:any) => {
        const credential = FacebookAuthProvider.credentialFromResult(res);
        const accessToken:any | undefined = credential?.accessToken;
        localStorage.setItem("access", accessToken)
        localStorage.setItem("token", res?.user?.accessToken)
        logger()
        fetch(`https://graph.facebook.com/${res.user.providerData[0].uid}/picture?type=large&access_token=${accessToken}`)
          .then((res) => res.blob())
          .then((blob: Blob) => {
            setProfilePicture(URL.createObjectURL(blob));
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const logger = () => {
    const storedToken:any = localStorage.getItem("token");
    if (storedToken) {
      const decodedToken:any = jwtDecode(storedToken);
      const currentTime = Date.now() / 1000;
      setIsLoger(true)
      // Kiểm tra xem JWT token có hết hạn hay không
      if (decodedToken.exp && decodedToken.exp > currentTime) {
        setUser(decodedToken)
      }
    }else {
      setIsLoger(false)
    }
  }
  useEffect(() => {  
    logger()
  }, []);

  const fetchUser = async () => {

    const access:any = localStorage.getItem("access");
    console.log(access, "accs");
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v17.0/me?access_token=${access}`
      );
      console.log(response, ".....");
      setApp(response.data)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
  });
  

  return (
   <div className='h-screen flex flex-col items-center justify-center'>
      {
        isLogger &&
        <>
          <div>
            <img src={user?.picture} alt="avatar" className='w-16 h-16 rounded-full shadow-sm'/>
            <p>{user?.name}</p>
            <p>{user?.email}</p>
          </div>
          <div>
            <p>id: {app?.id}</p>
            <p>name: {app?.name}</p>
          </div>
        </>
      }
      {
        isLogger ?
        <div className='py-5 px-10 shadow-xl'>
          <button className='bg-blue-500 px-2 py-1 text-white rounded-sm font-semibold ' onClick={handleLogout}>Logout</button>
        </div>:
        <div className='py-5 px-10 shadow-xl'>
          <button className='bg-blue-500 px-2 py-1 text-white rounded-sm font-semibold ' onClick={handleLoginFaceBook}>Login With FaceBook</button>
        </div>
      }
   </div>
  )
}
