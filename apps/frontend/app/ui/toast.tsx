"use client";

import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

type ToastType = "success" | "error";

type ToastProps = {
  message: string;
  type?: ToastType;
  isEntering?: boolean;
  isExiting?: boolean;
  onClose: () => void;
};

export function Toast({ message, type = "success", isEntering = false, isExiting = false, onClose }: ToastProps) {
  const Icon = type === "success" ? CheckCircleIcon : ExclamationCircleIcon;
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";

  let translateClass: string;
  if (isExiting) {
    translateClass = "translate-x-full";
  } else if (isEntering) {
    translateClass = "translate-x-full";
  } else {
    translateClass = "translate-x-0";
  }

  return (
    <div
      className={clsx(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg",
        "transition-all duration-300 ease-in-out",
        translateClass,
        isExiting ? "opacity-0" : "opacity-100",
      )}
      role="alert"
    >
      <Icon className={clsx("h-6 w-6", iconColor)} />
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
