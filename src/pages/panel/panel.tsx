import React, { useEffect, useState } from "react";
// import type { PostColorsMessage } from '../content/modules/middleware/middleware.types';
// import { MESSAGE_TYPES } from '../content/modules/middleware/middleware.types';
import { Button, Card, Chip, Separator } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { StorageItems } from "../content/modules/middleware/middleware.types";

export function Panel(): React.JSX.Element {
  const [elementsLimit, setElementsLimit] = useState(1);
  const [elements, setElements] = useState<Array<string>>([]);

  useEffect(() => {
    chrome.storage.sync.get<StorageItems>(
      ["maxLength", "elements"],
      function (result) {
        setElementsLimit(Number(result.maxLength ?? 1));
        setElements(result.elements ?? []);
      },
    );

    // Listen for storage changes
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      console.log("Panel: Storage change detected:", changes);

      // Handle elements changes
      if (changes.elements) {
        console.log("Panel: Elements changed to:", changes.elements.newValue);
        setElements(
          (changes.elements.newValue as StorageItems["elements"]) ?? [],
        );
      }

      // Handle maxLength changes
      if (!changes.maxLength) {
        return;
      }

      console.log("Panel: Max length changed to:", changes.maxLength.newValue);
      setElementsLimit(
        Number((changes.maxLength.newValue as StorageItems["maxLength"]) ?? 1),
      );
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    console.log("Panel: Storage listener added");

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      console.log("Panel: Storage listener removed");
    };
  }, []);

  const addElement = () => {
    if (elements.length >= elementsLimit) {
      console.log("Element limit reached");
      return;
    }

    const newElement = `Element ${elements.length + 1}`;
    const newElements = [...elements, newElement];

    chrome.storage.sync.set({ elements: newElements }, function () {
      setElements(newElements);
      console.log("Element added successfully");
    });
  };

  const refreshElements = () => {
    chrome.storage.sync.get<StorageItems>(["elements"], function (result) {
      setElements(result.elements ?? []);
    });
  };

  const clearElements = () => {
    chrome.storage.sync.set({ elements: [] }, function () {
      setElements([]);
      console.log("Elements cleared");
    });
  };

  return (
    <div className="h-full p-4">
      <h1
        data-testid="extension-panel-title"
        className="text-2xl font-bold text-gray-800 dark:text-white mb-6"
      >
        Extension Panel
      </h1>
      <Card className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <Card.Header className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:dev-to"
              className="text-2xl text-purple-600 dark:text-purple-400"
            />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              DevTools Panel
            </h3>
          </div>
          <Button
            variant="ghost"
            isIconOnly
            aria-label="Settings"
            onPress={() => {
              chrome.runtime.openOptionsPage();
            }}
          >
            <Icon icon="mdi:cog" className="text-lg" />
          </Button>
        </Card.Header>

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Icon
                icon="mdi:database-outline"
                className="text-green-500 dark:text-green-400"
              />
              <span>
                Currently stores{" "}
                <strong className="text-gray-800 dark:text-white">
                  {elements.length}
                </strong>{" "}
                elements
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Icon
                icon="mdi:information-outline"
                className="text-blue-500 dark:text-blue-400"
              />
              <span>
                Limit:{" "}
                <strong className="text-gray-800 dark:text-white">
                  {elementsLimit}
                </strong>{" "}
                elements
              </span>
            </div>

            {/* Elements List */}
            {elements.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stored Elements:
                </div>
                <div className="flex flex-wrap gap-2">
                  {elements.map((element, index) => (
                    <Chip key={index} variant="soft" color="accent" size="sm">
                      {element}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Icon
                  icon="mdi:lightbulb-outline"
                  className="text-blue-500 dark:text-blue-400"
                  width={42}
                />
                <span>
                  You can also send elements from the devtools panel using
                  background script!
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onPress={addElement}
                isDisabled={elements.length >= elementsLimit}
              >
                Add Element
              </Button>
              <Button variant="tertiary" size="sm" onPress={refreshElements}>
                Refresh
              </Button>
              {elements.length > 0 && (
                <Button variant="danger-soft" size="sm" onPress={clearElements}>
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
