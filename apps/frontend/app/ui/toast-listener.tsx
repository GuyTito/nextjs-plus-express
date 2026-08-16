"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Toast } from "./toast";

type ToastConfig = {
  message: string;
  type: "success" | "error";
};

export function ToastListener() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const message = searchParams.get("toast");
    const type = searchParams.get("toastType") || "success";

    if (message) {
      setIsEntering(true);
      setIsExiting(false);
      setToast({ message, type: type as "success" | "error" });

      const url = new URL(window.location.href);
      url.searchParams.delete("toast");
      url.searchParams.delete("toastType");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    if (isEntering && toast && !isExiting) {
      const enterTimer = setTimeout(() => {
        setIsEntering(false);
      }, 300);
      return () => clearTimeout(enterTimer);
    }
  }, [isEntering, toast, isExiting]);

  useEffect(() => {
    if (toast && !isEntering && !isExiting) {
      timerRef.current = setTimeout(() => {
        setIsExiting(true);
      }, 4000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast, isEntering, isExiting]);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        setToast(null);
        setIsExiting(false);
        setIsEntering(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  const handleClose = () => {
    setIsExiting(true);
  };

  if (!toast) return null;

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      isEntering={isEntering}
      isExiting={isExiting}
      onClose={handleClose}
    />
  );
}
