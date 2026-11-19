import { CheckIcon, InfoIcon, XIcon } from "@coss/ui/icons";
import classNames from "classnames";
import type { ExternalToast } from "sonner";
import { toast } from "sonner";

type IToast = {
  message: string;
  toastId: string | number;
  onClose: (toastId: string | number) => void;
};

export const SuccessToast = ({ message, onClose, toastId }: IToast) => (
  <button
    className={classNames(
      "data-testid-toast-success bg-default dark:bg-inverted text-emphasis dark:text-inverted shadow-elevation-low border-subtle mb-2 flex h-auto items-center justify-between space-x-2 rounded-md border px-3 py-2 text-[13px] font-medium rtl:space-x-reverse md:max-w-sm"
    )}
    onClick={() => onClose(toastId)}>
    <span>
      <CheckIcon className="size-4" />
    </span>
    <div className="flex items-center">
      <p data-testid="toast-success" className="m-0 w-full text-left">
        {message}
      </p>
    </div>
    <span>
      <XIcon className="size-4 hover:cursor-pointer" />
    </span>
  </button>
);

export const ErrorToast = ({ message, onClose, toastId }: IToast) => (
  <button
    className={classNames(
      "animate-fade-in-up bg-semantic-error-subtle text-semantic-error shadow-elevation-low border-semantic-error-subtle mb-2 flex h-auto items-center justify-between space-x-2 rounded-md border px-3 py-2.5 text-sm font-semibold rtl:space-x-reverse md:max-w-sm"
    )}
    onClick={() => onClose(toastId)}>
    <span>
      <InfoIcon className="text-semantic-error  size-4" />
    </span>
    <div className="flex items-center">
      <p data-testid="toast-error" className="m-0 w-full text-left">
        {message}
      </p>
    </div>
    <span>
      <XIcon className="text-semantic-error size-4 hover:cursor-pointer" />
    </span>
  </button>
);

export const WarningToast = ({ message, onClose, toastId }: IToast) => (
  <button
    className={classNames(
      "animate-fade-in-up bg-semantic-attention-subtle text-semantic-attention shadow-elevation-low border-semantic-attention-subtle mb-2 flex h-auto items-center justify-between space-x-2 rounded-md border px-3 py-2.5 text-sm font-semibold rtl:space-x-reverse md:max-w-sm"
    )}
    onClick={() => onClose(toastId)}>
    <span>
      <InfoIcon className="text-semantic-attention size-4" />
    </span>
    <div className="flex items-center">
      <p data-testid="toast-warning" className="m-0 w-full text-left">
        {message}
      </p>
    </div>
    <span>
      <XIcon className="text-semantic-attention size-4 hover:cursor-pointer" />
    </span>
  </button>
);

const TOAST_VISIBLE_DURATION = 6000;

type ToastVariants = "success" | "warning" | "error";

export function showToast(
  message: string,
  variant: ToastVariants,
  options: number | ExternalToast = TOAST_VISIBLE_DURATION
) {
  const _options: ExternalToast = typeof options === "number" ? { duration: options } : options;
  if (!_options.duration) _options.duration = TOAST_VISIBLE_DURATION;
  if (!_options.position) _options.position = "bottom-center";

  const onClose = (toastId: string | number) => {
    toast.dismiss(toastId);
  };

  // The toast library gives every toast a fixed-width slot; centre the (often shorter) toast inside it so a
  // bottom-centre toast really sits in the middle of the screen.
  const centred = (element: JSX.Element) => <div className="flex w-full justify-center">{element}</div>;
  const toastElements: { [x in ToastVariants]: (t: number | string) => JSX.Element } = {
    success: (toastId) => centred(<SuccessToast message={message} onClose={onClose} toastId={toastId} />),
    error: (toastId) => centred(<ErrorToast message={message} onClose={onClose} toastId={toastId} />),
    warning: (toastId) => centred(<WarningToast message={message} onClose={onClose} toastId={toastId} />),
  };

  return toast.custom(
    toastElements[variant] ||
      ((toastId) => <SuccessToast message={message} onClose={onClose} toastId={toastId} />),
    _options
  );
}
