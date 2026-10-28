import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Description,
  Input,
  Label,
  Separator,
  TextField,
  toast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import type { StorageItems } from "../content/modules/middleware/middleware.types";
import { MiddlewareProvider } from "../content/modules/middleware";

type OptionsProperties = {
  title: string;
};

const notify = () => {
  toast("Settings Saved", {
    description: "Your settings have been saved successfully!",
  });
};

function OptionsContent({ title }: OptionsProperties): React.JSX.Element {
  const [maxLength, setMaxLength] = useState("5");
  const [currentElements, setCurrentElements] = useState<Array<string>>([]);

  useEffect(() => {
    console.log("Options: useEffect running, loading from storage...");
    // Load maxLength and current elements
    chrome.storage.sync.get<StorageItems>(
      ["maxLength", "elements"],
      function (result) {
        console.log("Options: Storage result:", result);
        if (result.maxLength) {
          setMaxLength(result.maxLength);
        } else {
          setMaxLength("5");
        }
        setCurrentElements(result.elements ?? []);
      }
    );

    // Listen for storage changes
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      console.log("Options: Storage change detected:", changes);

      // Handle elements changes
      if (changes.elements) {
        console.log("Options: Elements changed to:", changes.elements.newValue);
        setCurrentElements(
          (changes.elements.newValue as StorageItems["elements"]) ?? []
        );
      }

      // Handle maxLength changes
      if (changes.maxLength) {
        console.log(
          "Options: Max length changed to:",
          changes.maxLength.newValue
        );
        setMaxLength(
          (changes.maxLength.newValue as StorageItems["maxLength"]) ?? "5"
        );
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    console.log("Options: Storage listener added");

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      console.log("Options: Storage listener removed");
    };
  }, []);

  const handleSave = () => {
    const newMaxLength = Number.parseInt(maxLength);

    // Check if current elements exceed the new limit
    if (currentElements.length > newMaxLength) {
      toast("Warning", {
        description: `Current elements (${currentElements.length}) exceed the new limit (${newMaxLength}). Some elements will be removed.`,
      });

      // Truncate elements to fit new limit
      const truncatedElements = currentElements.slice(0, newMaxLength);
      chrome.storage.sync.set(
        {
          maxLength: maxLength,
          elements: truncatedElements,
        },
        function () {
          setCurrentElements(truncatedElements);
          notify();
        }
      );
    } else {
      chrome.storage.sync.set(
        {
          maxLength: maxLength,
        },
        function () {
          notify();
        }
      );
    }
  };

  const resetToDefaults = () => {
    setMaxLength("5");

    chrome.storage.sync.set(
      {
        maxLength: "5",
        elements: [],
      },
      function () {
        setCurrentElements([]);
        toast("Defaults Restored", {
          description: "Settings have been reset to default values.",
        });
      }
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <Card.Content className="flex flex-row items-center justify-between py-6 px-8">
            <div className="flex items-center gap-3">
              <Icon
                icon="mdi:extension"
                className="text-3xl text-blue-600 dark:text-blue-400"
              />
              <span className="text-2xl font-black text-gray-800 dark:text-white">
                Acme
              </span>
            </div>
            <div className="flex flex-row gap-2">
              <Button
                variant="outline"
                onPress={() => {
                  chrome.tabs.create({ url: "chrome://newtab" });
                }}
                size="sm"
              >
                Open New Tab
              </Button>
            </div>
          </Card.Content>
        </Card>

        <h1
          data-testid="extension-options-title"
          className="capitalize text-3xl font-bold text-gray-800 dark:text-white mb-8 transition-colors"
        >
          {title}
        </h1>

        {/* General Settings */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              General Settings
            </h2>
          </Card.Header>
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          <Card.Content>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField value={maxLength} onChange={setMaxLength}>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Maximum Elements
                  </Label>
                  <Input
                    placeholder="Enter max elements limit"
                    type="number"
                    min="1"
                    max="100"
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                  <Description className="text-gray-600 dark:text-gray-400">
                    {`Maximum number of elements the extension can store. Current: ${currentElements.length} elements`}
                  </Description>
                </TextField>

                <TextField>
                  <Label className="text-gray-700 dark:text-gray-300">
                    Auto-save Interval
                  </Label>
                  <Input
                    placeholder="5 minutes"
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                  <Description className="text-gray-600 dark:text-gray-400">
                    How often to automatically save data
                  </Description>
                </TextField>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="primary" onPress={handleSave}>
                  <Icon icon="mdi:content-save" />
                  Save Settings
                </Button>
                <Button variant="tertiary" onPress={resetToDefaults}>
                  <Icon icon="mdi:refresh" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Extension Information */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Extension Information
            </h2>
          </Card.Header>
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Icon
                  icon="mdi:shield-check"
                  className="text-3xl text-blue-600 dark:text-blue-400 mx-auto mb-3"
                />
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
                  Secure
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built with security in mind
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Icon
                  icon="mdi:rocket-launch"
                  className="text-3xl text-green-600 dark:text-green-400 mx-auto mb-3"
                />
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
                  Fast
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optimized for performance
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Icon
                  icon="mdi:palette"
                  className="text-3xl text-purple-600 dark:text-purple-400 mx-auto mb-3"
                />
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
                  Beautiful
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modern and clean design
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Quick Actions
            </h2>
          </Card.Header>
          <Separator className="bg-gray-200 dark:bg-gray-700" />
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="secondary"
                fullWidth
                className="h-16 text-left justify-start bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                onPress={() => {
                  chrome.tabs.create({ url: "chrome://extensions" });
                }}
              >
                <Icon icon="mdi:puzzle" className="text-2xl" />
                <div className="text-left">
                  <div className="font-semibold text-gray-800 dark:text-white">
                    Extensions Settings
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your extensions
                  </div>
                </div>
              </Button>

              <Button
                variant="tertiary"
                fullWidth
                className="h-16 text-left justify-start bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                onPress={() => {
                  chrome.tabs.create({
                    url: "https://github.com/tymzar/web-extension",
                  });
                }}
              >
                <Icon icon="mdi:github" className="text-2xl" />
                <div className="text-left">
                  <div className="font-semibold text-gray-800 dark:text-white">
                    GitHub Repository
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    View source code
                  </div>
                </div>
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export function Options({ title }: OptionsProperties): React.JSX.Element {
  return (
    <MiddlewareProvider>
      <OptionsContent title={title} />
    </MiddlewareProvider>
  );
}
