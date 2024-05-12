import Logo from "../../../../public/assets/svg/beginnergain-logo-black.svg";
import Input from "@/components/internal/common/Input";
import BigButton from "@/components/internal/common/BigButton";
import Link from 'next/link';
import React, {useState} from "react";
import Image from "next/image";
import {useRouter} from "next/router";
import {useMutation} from "react-query";
import {IJoin, IJoinResponse} from "@/types/User";
import {emailValid, join} from "@/server/user";
import {AxiosResponse} from "axios";
import {setCookie} from "cookies-next";
import {emailCheck} from "@/assets/utils";

const Screen = () => {
    const [inputValue, setInputValue] = useState({
        email: '',
        password: '',
        name: '',
    });

    // 중복 이메일 체크
    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean>(true);
    // 이메일 포맷 체크
    const [isEmailValid, setIsEmailValid] = useState<boolean>(true);

    const router = useRouter();

    const requiredFields = [inputValue.email, inputValue.password, inputValue.name, isEmailAvailable, isEmailValid];

    // 버튼 활성화 여부를 나타내는 변수
    const isButtonActive = requiredFields.every(item => Boolean(item));

    const joinMutation = useMutation({
        mutationFn: (joinData : IJoin) => {
            return join(joinData);
        },
        onSuccess(data : AxiosResponse) {
            const joinData : IJoinResponse = data.data;
            // 쿠키로 token 저장 (현재 testToken으로 대체)
            setCookie('accessId', joinData.id);
            router.push('/');
        },
        onError(err) {
            console.log(err);
        }
    });

    const emailValidMutation = useMutation({
        mutationFn: (email : string) => {
            return emailValid(email);
        },
        onSuccess(data : AxiosResponse) {
            const result = data.data.isAvailable;
            console.log(result);
            setIsEmailAvailable(result);
        },
        onError(err) {
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue({...inputValue, [e.target.name]: e.target.value });
        if(e.target.name === "email") {
            // 이메일 중복 체크
            emailValidMutation.mutate(e.target.value);
            // 이메일 포맷 체크
            const emailInfo = emailCheck(e.target.value);
            setIsEmailValid(Boolean(emailInfo));
        }
    };

    const handleSubmitButtonClick = () => {
        joinMutation.mutate({
            email: inputValue.email,
            password: inputValue.password,
            name: inputValue.name,
        });
    };

    return (
        <div className="flex h-screen">
            <div className="flex-1 p-[10vh] flex flex-col">
                <div className="flex flex-1 flex-col">
                    <h2 className="font-en text-lg font-semibold mb-[7vh]">Create New Account</h2>
                    <div className="mb-12">
                        <p className="font-en text-sm pb-5">Email Address</p>
                        <Input
                            placeholder={"이메일을 입력하세요"}
                            value={inputValue.email}
                            name="email"
                            handleInputChange={handleInputChange}/>
                        {!isEmailAvailable &&
                            <p className="text-xxs text-red-600 mt-1">
                                이미 가입한 이메일입니다.
                            </p>
                        }
                        {!isEmailValid &&
                            <p className="text-xxs text-red-600 mt-1">
                                이메일 형식이 유효하지 않습니다.
                            </p>
                        }
                    </div>
                    <div className="mb-12">
                        <p className="font-en text-sm pb-5">Password</p>
                        <Input
                            placeholder={"비밀번호를 입력하세요"}
                            value={inputValue.password}
                            name="password"
                            handleInputChange={handleInputChange}/>
                    </div>
                    <div className="mb-12">
                        <p className="font-en text-sm pb-5">Name</p>
                        <Input
                            placeholder={"이름을 입력하세요"}
                            value={inputValue.name}
                            name="name"
                            handleInputChange={handleInputChange}/>
                    </div>
                </div>
                <BigButton
                    name="회원가입"
                    color={'blue'}
                    isFilled={true}
                    isDisabled={!isButtonActive}
                    onClick={handleSubmitButtonClick}/>
            </div>
            <div className="flex flex-col flex-1 bg-purple-100 h-[100vh] min-w-[50vw] p-[6vh]">
                <div className="self-end">
                  <Link href={'/'}>
                    <Logo />
                  </Link>
                </div>
                <div className="w-[31vw] h-[31vw] mx-auto mt-[8vh]">
                    <Image
                        src="https://beginergain.s3.ap-northeast-2.amazonaws.com/develop/working-illust.svg"
                        alt="로그인 일러스트"
                        width="1000"
                        height="1000"
                        priority={true}/>
                </div>
            </div>
        </div>
    );
};

export default Screen;