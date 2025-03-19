import React, { useEffect, useState, useRef } from "react";
import { Chrono } from "react-chrono";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function Timeline({ items, onSelectItem }) {
  const [isClient, setIsClient] = useState(false);
  const hasLoaded = useRef(false); // Ref to track if the component has loaded

  useEffect(() => {
    setIsClient(true);

    const handleClick = (event) => {
      const chronoItems = document.querySelectorAll(
        ".TimelineCardHeader .chrono-item"
      );

      chronoItems.forEach((item, index) => {
        if (item.contains(event.target)) {
          const selectedItem = transformedItems[index];
          onSelectItem(selectedItem);
        }
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  const transformedItems = items.map((item) => {
    return {
      title: format(new Date(item.date), "PPP", {
        locale: ptBR,
      }),
      sortDate: new Date(item.date),
      cardTitle: item.title,
      cardSubtitle: item.text,
      id: item.id,
    };
  });

  transformedItems.sort((a, b) => a.sortDate - b.sortDate);

  return (
    <Chrono
      disableToolbar
      items={transformedItems}
      mode="VERTICAL_ALTERNATING"
      allowDynamicUpdate={true}
      textDensity="LOW"
    />
  );
}

export default Timeline;
