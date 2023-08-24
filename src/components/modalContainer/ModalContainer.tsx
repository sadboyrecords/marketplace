import Typography from "@/components/typography";
import Button from "@/components/buttons/Button";
// import Button from 'components/Buttons/Button';

interface ModalContainerProps {
  children?: React.ReactNode;
  primaryAction?: () => void;
  handleCancel?: () => void;
  primaryButtonName?: string;
  secondaryAction?: () => void;
  secondaryButtonName?: string;
  title?: string;
  open: boolean;
  body?: string;
  hideCloseButton?: boolean;
  fullWidth?: boolean;
}

function ModalContainer({
  children,
  open = false,
  title,
  body,
  primaryButtonName,
  primaryAction,
  secondaryAction,
  secondaryButtonName,
  handleCancel,
  hideCloseButton = false,
  fullWidth = false,
}: ModalContainerProps) {
  return (
    <>
      <div
        // sm:w-11/12
        className={`modal modal-middle${
          fullWidth ? " sm:modal-middle" : "sm:modal-middle"
        }  ${open ? "modal-open" : ""}`}
      >
        <div className="modal-box relative border-2 border-base-300">
          {!hideCloseButton && (
            <Button
              title="Close"
              variant="outlined"
              color="neutral"
              className="absolute right-2 top-2"
              onClick={handleCancel}
            >
              <Typography size="body-sm"> x</Typography>
            </Button>
          )}

          <Typography size="display-sm" className="">
            {title}
          </Typography>
          <div className="py-4">
            <Typography>{body}</Typography>
          </div>
          <div className="py-4">{children}</div>

          <div className="modal-action">
            {secondaryButtonName && (
              <Button
                rounded="md"
                variant="outlined"
                color="primary"
                onClick={secondaryAction}
              >
                {secondaryButtonName}
              </Button>
            )}

            {primaryButtonName && (
              <Button rounded="md" color="primary" onClick={primaryAction}>
                {primaryButtonName}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalContainer;
