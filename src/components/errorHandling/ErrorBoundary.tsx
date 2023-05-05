import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorFallback from "./ErrorFallback";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // constructor(props) {
  //   super(props)

  //   // Define a state variable to track whether is an error or not
  //   this.state = { hasError: false }
  // }
  public state: State = {
    hasError: false,
  };
  static getDerivedStateFromError(error: ErrorInfo): State {
    // Update state so the next render will show the fallback UI
    console.log({ error });

    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can use your own error logging service here
    console.log({ error, errorInfo });
  }
  render() {
    // Check if the error is thrown
    {
      // console.log({ stateREnder: this.state });
    }
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorFallback />;
    }

    // Return children components in case of no error
    return this.props.children;
  }
}

export default ErrorBoundary;
