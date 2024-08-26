import { useCallback, useReducer } from "react";
import { useRef } from "react";

import { CalendarIcon } from "lucide-react";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

import { NaturalLanguageDateTimePicker, DateSuggestion } from "./nlp.ts";
import { cn } from "@/lib/utils.ts";

const initialState = {
  inputValue: "",
  isActive: false,
  suggestions: new NaturalLanguageDateTimePicker().generateSuggestions(""),
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_INPUT_VALUE":
      return { ...state, inputValue: action.payload, date: null };
    case "SET_DATE":
      return { ...state, date: action.payload };
    case "SET_IS_ACTIVE":
      return { ...state, isActive: action.payload };
    case "SET_SUGGESTIONS":
      return { ...state, suggestions: action.payload };
    default:
      return state;
  }
}
const DateTimePickerComponent = ({ setDate, className = "" }: { className?: string; setDate?: (date: Date) => void }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dateTimePicker = useRef(new NaturalLanguageDateTimePicker());

  const generateSuggestions = useCallback((value: string) => {
    const suggestions = dateTimePicker.current.generateSuggestions(value);
    dispatch({ type: "SET_SUGGESTIONS", payload: suggestions });
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      dispatch({ type: "SET_INPUT_VALUE", payload: value });
      generateSuggestions(value);
    },
    [generateSuggestions]
  );

  const handleSuggestionClick = useCallback((suggestion: DateSuggestion) => {
    dispatch({ type: "SET_INPUT_VALUE", payload: suggestion.text });
    dispatch({ type: "SET_DATE", payload: suggestion.date });
    dispatch({ type: "SET_IS_ACTIVE", payload: false });
  }, []);

  const handleFocus = useCallback(() => {
    dispatch({ type: "SET_IS_ACTIVE", payload: true });
    dispatch({ type: "SET_OPEN", payload: true });
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!state.open) {
        dispatch({ type: "SET_IS_ACTIVE", payload: false });
      }
    }, 200);
  }, [state.open]);

  const formatDate = useCallback((date: Date | null) => {
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
    <div>
      <Command
        shouldFilter={false}
        className={cn(`w-[350px] rounded-lg border ${state.isActive ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`, className)}
      >
        <div className="relative">
          <CommandInput
            placeholder="Enter a date or time..."
            value={state.inputValue}
            onValueChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="focus:outline-none pr-24"
          />
          {state.date && <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">{formatDate(state.date)}</div>}
        </div>
        <CommandList style={{}}>
          {state.isActive ? (
            state.suggestions.length > 0 ? (
              <CommandGroup>
                {state.suggestions.map((suggestion, index) => (
                  <CommandItem key={index} onSelect={() => handleSuggestionClick(suggestion)}>
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{suggestion.text}</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(suggestion.date)}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty></CommandEmpty>
            )
          ) : null}
        </CommandList>
      </Command>
    </div>
  );
};

export default DateTimePickerComponent;
