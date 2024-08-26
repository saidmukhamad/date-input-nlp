import DateTimePickerComponent_0 from "widgets/DateTimePicker_v0";
import DateTimePickerComponent from "widgets/DateTimePicker_v1";
import Syntax from "react-syntax-highlighter";
import { docco, a11yDark, atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
const style = atomOneDark;
function DateTimePage() {
  const handleDateSelect = (date) => {
    console.log("Selected date:", date);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Natural Language Date-Time Picker for React</h1>
        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Features</h2>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base">
          <li>Parse natural language inputs like "tomorrow at 3pm" or "next Friday at noon"</li>
          <li>Real-time suggestions as users type</li>
          <li>Sleek, modern UI with customizable styling</li>
          <li>Easy integration with React projects</li>
        </ul>
        <p className="text-xl sm:text-2xl font-semibold mt-8 mb-4">
          Idea taken from{" "}
          <a className="underline text-blue-400" href="https://x.com/zehf/status/1828058426984829041">
            here
          </a>
        </p>
        <iframe
          src="https://ghbtns.com/github-btn.html?user=saidmukhamad&repo=date-input-nlp&type=star&count=true&size=large"
          width="170"
          height="30"
          title="GitHub"
        ></iframe>

        <div className="flex flex-col lg:flex-row justify-between">
          <div className="lg:w-1/2 mb-8 lg:mb-0 lg:mr-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">1. Chrono-based Picker (Recommended)</h3>
            <p className="mb-4 text-sm sm:text-base">
              This is the efficient, production-ready version. It uses the powerful Chrono library for parsing, offering robust and accurate results.
            </p>
            <div className="bg-white p-4 rounded-lg shadow-md  overflow-y-auto">
              <DateTimePickerComponent className="w-full" setDate={handleDateSelect} />
            </div>
          </div>

          <div className="lg:w-1/2 lg:ml-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">2. Reminder of shame (08/26/2024)</h3>
            <p className="mb-4 text-sm sm:text-base">
              This version uses custom regex patterns for parsing. I spent nearly two hours sweating and writing baddest code impossible and then learned about&nbsp;
              <a className="underline text-blue-400" href="https://github.com/wanasit/chrono">
                chrononlp
              </a>
            </p>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto">
              <DateTimePickerComponent_0 className="w-full z-10" setDate={handleDateSelect} />
            </div>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">How to Use</h2>
        <p className="mb-4 text-sm sm:text-base">Integrating the Date-Time Picker into your React project is simple:</p>
        <Syntax language="javascript" style={style}>
          {`import React from 'react';
  import { DateTimePickerComponent } from './path-to-components';
  
  function MyApp() {
    const handleDateSelect = (date) => {
      console.log("Selected date:", date);
    };
  
    return (
      <div>
        <h2>Chrono-based Picker</h2>
        <DateTimePickerComponent setDate={handleDateSelect} />
      </div>
    );
  }`}
        </Syntax>

        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">Which One Should You Use?</h2>
        <ul className="list-disc list-inside mb-4 text-sm sm:text-base">
          <li>
            <strong>First (DateTimePickerComponent)</strong>
          </li>
        </ul>
        <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-4">GitHub Repository</h2>
        <p className="mb-4 text-sm sm:text-base">
          For the full source code, installation instructions, and more examples, check out our
          <a href="https://github.com/saidmukhamad/date-input-nlp" className="text-blue-600 hover:underline">
            {" "}
            GitHub repository
          </a>
          .
        </p>
      </div>
    </div>
  );
}
export default DateTimePage;
