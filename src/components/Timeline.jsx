import React, { useEffect, useState, useRef } from "react";
import { Chrono } from "react-chrono";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function Timeline({ items, onSelectItem }) {
  const [isClient, setIsClient] = useState(false);
  const hasLoaded = useRef(false); // Ref to track if the component has loaded

  useEffect(() => {
    setIsClient(true);
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
      onItemSelected={(e) => {
        if (hasLoaded.current) {
          onSelectItem(transformedItems[e.index]);
        }
        hasLoaded.current = true; // Set the flag to true after the first render
      }}
      allowDynamicUpdate={true}
      textDensity="LOW"
    />
  );
}

export default Timeline;
