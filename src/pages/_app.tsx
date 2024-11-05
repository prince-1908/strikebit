import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";
import "../assets/styles/styles.scss";

import type { AppProps } from "next/app";
import Head from "next/head";
import { Bai_Jamjuree } from 'next/font/google'
import { ToastContainer } from "react-toastify";
import React, { useEffect } from "react";
import { HeaderSEO } from "@/components/main-layout/HeaderSEO";
import { MainLayout } from "@/components/main-layout/MainLayout";
import { FauxAuthenticationPortal } from "@/components/FauxAuthenticationPortal";
import { MaintenanceAlert } from "@/components/main-layout/MaintenanceAlert";

const baiJamjureeFont = Bai_Jamjuree({
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

function ToastInitializer() {
  return <>
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={true}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      theme="colored"
    />
  </>
}

export default function MyApp(appProps: AppProps) {
  const {Component, pageProps} = appProps;
  const fauxAuthenticationPortal = FauxAuthenticationPortal();

  return (
    <>
      <Head>
        <title>DistriBrain</title>
        <HeaderSEO/>
      </Head>

      <style jsx global>{`
          html {
            --font-primary: ${baiJamjureeFont.style.fontFamily};
          }
      `}</style>

      <MaintenanceAlert/>

      {fauxAuthenticationPortal != null && fauxAuthenticationPortal}
      {fauxAuthenticationPortal == null && <>
          <MainLayout>
              <Component {...pageProps} />
          </MainLayout>
      </>}

      <ToastInitializer/>
    </>
  );
}


