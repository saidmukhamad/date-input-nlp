import React, { useState, ReactNode, PropsWithChildren } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StandProps {
  backgroundColor: string;
}

const Stand: React.FC<PropsWithChildren<StandProps>> = ({ children, backgroundColor }) => {
  return (
    <div style={{ backgroundColor, padding: "20px" }} className="flex  justify-center items-center w-full h-full min-h-[100dvh]">
      {children}
    </div>
  );
};

const DebugStand: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Card className="mt-4">
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">Debug Panel</h3>
        {children}
      </CardContent>
    </Card>
  );
};

interface ComponentDebugSettingsProps {
  onColorChange: (color: string) => void;
}

const ComponentDebugSettings: React.FC<ComponentDebugSettingsProps> = ({ onColorChange }) => {
  return (
    <div>
      <Label htmlFor="bgColor">Background Color</Label>
      <Input id="bgColor" type="color" onChange={(e) => onColorChange(e.target.value)} className="w-full" />
    </div>
  );
};

const StandWithDebug: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [bgColor, setBgColor] = useState("black");

  const handleColorChange = (color: string) => {
    setBgColor(color);
  };

  const standChildren: ReactNode[] = [];
  let debugStand: ReactNode | null = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === DebugStand) {
        debugStand = React.cloneElement(child, {
          children: React.Children.map(child.props.children, (debugChild) => {
            if (React.isValidElement(debugChild) && debugChild.type === ComponentDebugSettings) {
              return React.cloneElement(debugChild, { onColorChange: handleColorChange });
            }
            return debugChild;
          }),
        });
      } else {
        standChildren.push(child);
      }
    }
  });

  return (
    <div>
      <Stand backgroundColor={bgColor}>{standChildren}</Stand>
      {debugStand}
    </div>
  );
};

export { StandWithDebug, DebugStand, ComponentDebugSettings };
