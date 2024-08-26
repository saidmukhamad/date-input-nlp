import { useState, useEffect } from "react";

const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowWidth;
};

const GOOGLE_MAPS_API_KEY = "AIzaSyBFuqGYLIjSrvfikyB5Yl8uVYQcBMmVNnc";

interface GoogleMapsScriptStatus {
  loaded: boolean;
  error: Error | null;
}

export const useGoogleMapsScript = (): GoogleMapsScriptStatus => {
  const [scriptStatus, setScriptStatus] = useState<GoogleMapsScriptStatus>({
    loaded: false,
    error: null,
  });

  useEffect(() => {
    if (window.google && window.google.maps) {
      setScriptStatus({ loaded: true, error: null });
      return;
    }

    const scriptId = "google-maps-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const handleScriptLoad = () => setScriptStatus({ loaded: true, error: null });
    const handleScriptError = () => setScriptStatus({ loaded: false, error: new Error("Google Maps script failed to load") });

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", handleScriptLoad);
    script.addEventListener("error", handleScriptError);

    return () => {
      script.removeEventListener("load", handleScriptLoad);
      script.removeEventListener("error", handleScriptError);
    };
  }, []);

  return scriptStatus;
};

import { useCallback } from "react";
const useClickOutside = (ref, callback) => {
  const handleClick = useCallback(
    (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    },
    [ref, callback]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [handleClick]);
};

export default useGoogleMapsScript;

export { useWindowWidth, useClickOutside };
