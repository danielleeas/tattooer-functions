import React from "npm:react";
import { Body, Column, Container, Head, Heading, Hr, Html, Img, Font, Link, Preview, Row, Section, Tailwind, Text } from 'npm:@react-email/components';
export default function ArtistNew({ artistName, artistBookingLink }) {
  const previewText = "Welcome to Simple Tattooer! Your account is set up. To get started, just click below:";
  return /*#__PURE__*/ React.createElement(Html, null, /*#__PURE__*/ React.createElement(Tailwind, null, /*#__PURE__*/ React.createElement(Head, null, /*#__PURE__*/ React.createElement(Font, {
    fontFamily: "Arial",
    fallbackFontFamily: "Arial",
    webFont: {
      url: "https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/fonts/arial_ce.woff2",
      format: "woff2"
    },
    fontWeight: 400,
    fontStyle: "normal"
  }), /*#__PURE__*/ React.createElement("style", null, `
                        .desktop-hide { display: none !important; }
                        @media only screen and (max-width: 480px) {
                            .mobile-block { display: block !important; width: 100% !important; }
                            .mobile-center { text-align: center !important; }
                            .mobile-hide { display: none !important; }
                            .mobile-mt-16 { margin-top: 16px !important; }
                        }
                        `)), /*#__PURE__*/ React.createElement(Preview, null, previewText), /*#__PURE__*/ React.createElement(Body, {
    className: "mx-auto my-auto max-w-[600px] bg-[#05080F] font-sans"
  }, /*#__PURE__*/ React.createElement(Container, {
    className: "mx-auto max-w-[600px] py-[40px] px-4"
  }, /*#__PURE__*/ React.createElement(Section, {
    className: "mx-auto max-w-[472px]"
  }, /*#__PURE__*/ React.createElement(Img, {
    src: "https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/icons/logo.png",
    alt: "Simple Tattooer",
    width: "64",
    height: "64",
    className: "mb-[10px] mx-auto"
  }), /*#__PURE__*/ React.createElement(Heading, {
    className: "text-white text-[18px] font-normal text-center p-0 mx-0 my-0 uppercase"
  }, "simple"), /*#__PURE__*/ React.createElement(Heading, {
    className: "text-white text-[18px] font-normal text-center p-0 mx-0 my-0 uppercase"
  }, "tattooer")), /*#__PURE__*/ React.createElement(Section, {
    className: "mt-[40px] mx-auto max-w-[472px]"
  }, /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[16px] leading-[20px] my-0 mb-4"
  }, "Hi ", artistName, ", weclome to Simple Tattooer!"), /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[16px] leading-[20px] my-0 mb-4"
  }, "Your subscription is active, and your account is set up!"), /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[16px] leading-[20px] my-0 mb-0"
  }, "Your Personal Booking Link and matching QR code are below(this can be edited anytime in Your Settings in the app):"), /*#__PURE__*/ React.createElement(Text, {
    className: "text-[#058CFA] text-[16px] leading-[20px] my-0 mb-1"
  }, artistBookingLink), /*#__PURE__*/ React.createElement(Img, {
    src: "https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/icons/Rectangle.png",
    alt: "Simple Tattooer",
    width: "160",
    height: "160",
    className: "mb-4"
  }), /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[16px] leading-[20px] my-0 mb-4"
  }, "Share it on Instagram, your website, or anywhere else so clients can fill out your booking form, make a consultation appointment, and more."), /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[16px] leading-[20px] my-0 mb-4"
  }, "Need help with the app? We've made short walkthrough videos for every feature:"), /*#__PURE__*/ React.createElement(Link, {
    href: "https://example.com",
    className: "text-[#058CFA] text-[16px] leading-[20px] my-0"
  }, "Watch the Demo Videos"), /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[16px] leading-[20px] my-0 mt-4"
  }, "Thanks for being here —"), /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[16px] leading-[20px] my-0"
  }, "The Simple Tattooer Team")), /*#__PURE__*/ React.createElement(Section, {
    className: "mt-[40px] mx-auto max-w-[472px]"
  }, /*#__PURE__*/ React.createElement(Row, null, /*#__PURE__*/ React.createElement(Column, {
    className: "mobile-block",
    style: {
      verticalAlign: 'top'
    }
  }, /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[10px] leading-[14px] my-0 mb-2"
  }, "Download Our App"), /*#__PURE__*/ React.createElement(Row, null, /*#__PURE__*/ React.createElement(Column, {
    align: "left"
  }, /*#__PURE__*/ React.createElement(Link, {
    href: "https://play.google.com/store"
  }, /*#__PURE__*/ React.createElement(Img, {
    src: "https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/icons/android_store_btn.png",
    alt: "Get it on Google Play",
    width: "96",
    height: "32",
    style: {
      display: 'inline'
    }
  })), "  ", /*#__PURE__*/ React.createElement(Link, {
    href: "https://apps.apple.com/app"
  }, /*#__PURE__*/ React.createElement(Img, {
    src: "https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/icons/apple_store_btn.png",
    alt: "Download on the App Store",
    width: "96",
    height: "32",
    style: {
      display: 'inline'
    }
  }))))), /*#__PURE__*/ React.createElement(Column, {
    className: "mobile-block mobile-mt-16",
    width: "45px",
    style: {
      verticalAlign: 'top'
    }
  }, /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[10px] leading-[14px] my-0 mb-2"
  }, "Follow Us"), /*#__PURE__*/ React.createElement(Link, {
    href: "https://instagram.com",
    target: "_blank"
  }, /*#__PURE__*/ React.createElement(Img, {
    src: "https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/icons/mdi_instagram.png",
    alt: "Instagram",
    width: "24",
    height: "24"
  })))), /*#__PURE__*/ React.createElement(Hr, {
    style: {
      borderColor: '#1E293B'
    }
  }), /*#__PURE__*/ React.createElement(Text, {
    className: "text-white text-[12px] leading-[16px] my-0 mt-3"
  }, "© 2025 Simple Tattooer. All Rights Reserved"))))));
}
