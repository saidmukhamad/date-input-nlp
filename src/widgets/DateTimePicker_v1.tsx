import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import * as chrono from "chrono-node";
import { CalendarIcon } from "lucide-react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

const initialState = {
  inputValue: "",
  isOpen: false,
  suggestions: [],
  date: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_INPUT_VALUE":
      return { ...state, inputValue: action.payload };
    case "SET_DATE":
      return { ...state, date: action.payload };
    case "SET_SUGGESTIONS":
      return { ...state, suggestions: action.payload };
    case "SET_IS_OPEN":
      return { ...state, isOpen: action.payload };
    default:
      return state;
  }
};

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const DateTimePickerComponent = ({ setDate, className = "" }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inputRef = useRef(null);

  const generateSuggestions = useCallback((value) => {
    if (!value.trim()) {
      dispatch({ type: "SET_SUGGESTIONS", payload: [] });
      return;
    }

    const now = new Date();
    const results = chrono.parse(value, now, { forwardDate: true });
    const suggestions = results.map((result) => ({
      text: result.text,
      date: result.start.date(),
    }));

    dispatch({ type: "SET_SUGGESTIONS", payload: suggestions });
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      dispatch({ type: "SET_INPUT_VALUE", payload: value });
      generateSuggestions(value);
      dispatch({ type: "SET_IS_OPEN", payload: true });
    },
    [generateSuggestions]
  );

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      dispatch({ type: "SET_INPUT_VALUE", payload: suggestion.text });
      dispatch({ type: "SET_DATE", payload: suggestion.date });
      dispatch({ type: "SET_IS_OPEN", payload: false });
      if (setDate) setDate(suggestion.date);
      inputRef.current?.focus();
    },
    [setDate]
  );

  const formatDate = useCallback((date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }, []);

  return (
    <Popover open={state.isOpen} onOpenChange={(open) => dispatch({ type: "SET_IS_OPEN", payload: open })}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            placeholder="Enter a date or time..."
            value={state.inputValue}
            onChange={handleInputChange}
            className={cn(`pr-24 bg-transparent ${state.isOpen ? "border-blue-500 ring-2 ring-blue-200" : ""}`, className)}
          />
          {state.date && <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">{formatDate(state.date)}</div>}
        </div>
      </PopoverTrigger>
      <PopoverContent style={{ width: inputRef.current?.offsetWidth ?? "350px" }} className="mt-1 p-0" onOpenAutoFocus={(e) => e.preventDefault()} align="start">
        {state.suggestions.length > 0 ? (
          state.suggestions.map((suggestion, index) => (
            <div key={index} className="flex justify-between items-center w-full p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSuggestionClick(suggestion)}>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{suggestion.text}</span>
              </div>
              <span className="text-sm text-gray-500">{formatDate(suggestion.date)}</span>
            </div>
          ))
        ) : (
          <div className="p-2 w-full text-gray-500">No suggestions found</div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DateTimePickerComponent;
