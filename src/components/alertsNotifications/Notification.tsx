import {
  primaryNotificationMessage,
  secondaryNotificationMessage,
} from "@/utils/helpers";
import {
  InformationCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

interface NotificationProps {
  children?: React.ReactNode;
  primaryMessage?: string;
  type: "success" | "error" | "info" | "warning";
  secondaryMessage?: string;
}

const icon = {
  success: <CheckCircleIcon className="text-success h-6 w-6" />,
  error: <ExclamationCircleIcon className="text-error h-6 w-6" />,
  info: <InformationCircleIcon className="h-6 w-6 text-info" />,
  warning: <ExclamationTriangleIcon className="text-warning h-6 w-6" />,
};

function Notification({
  children,
  type,
  primaryMessage,
  secondaryMessage,
}: NotificationProps) {
  return (
    <div className={`rounded-lg border border-gray-300 p-2 shadow-lg`}>
      <div className="flex flex-row">
        {icon[type]}
        <div className="ml-2 mr-6">
          <span className="font-semibold">
            {primaryMessage || primaryNotificationMessage[type]}
          </span>
          <span className="block text-gray-500">
            {secondaryMessage || secondaryNotificationMessage[type]}
          </span>
          <div className="text-gray-500">{children}</div>
          {/* {linkName && (
                    <div className="mt-2">
                        <Link href={linkHref} btnLink passHref>
                            {' '}
                            {linkName}{' '}
                        </Link>
                    </div>
                )} */}
        </div>
      </div>
    </div>
  );
}

export default Notification;
