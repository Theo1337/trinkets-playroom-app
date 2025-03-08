import React from "react";
import HorizontalTimeline from "react-horizontal-timeline";

import { Button } from "@/components/ui/button";

import { X } from "lucide-react";
import { api } from "@/utils";

export default class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curIdx: 0,
      prevIdx: -1,
      items: props.items,
    };
  }

  render() {
    const { curIdx } = this.state;
    const item = {
      title: this.state.items[curIdx].title,
      text: this.state.items[curIdx].text,
      formatedDate: this.state.items[curIdx].formatedDate,
    };

    return (
      <div>
        <div
          style={{
            width: "100%",
            height: "150px",
            margin: "0 auto",
          }}
          className="w-full text-sm flex items-center justify-start"
        >
          <HorizontalTimeline
            styles={{
              background: "#f8f8f8",
              foreground: "#22c55e",
              outline: "#dfdfdf",
            }}
            index={this.state.curIdx}
            indexClick={(index) => {
              const curIdx = this.state.curIdx;
              this.setState({ curIdx: index, prevIdx: curIdx });
            }}
            values={this.state.items.map((x) => x.date)}
          />
        </div>
        <div className="bg-slate-200 relative p-4 flex flex-col items-center justify-center gap-4 rounded-lg px-6">
          <div className="text-center grid place-items-center text-lg font-bold uppercase">
            {item.title}
            <div className="text-sm text-neutral-500 font-normal">
              {item.formatedDate}
            </div>
          </div>

          {/* Remove button  */}
          <div
            onClick={() => {
              api
                .delete(`/events/${this.state.items[curIdx].id}`)
                .then((res) => {
                  const data = this.state.items.filter(
                    (each) => each.id !== res.data.id
                  );
                  if (data.length == 0) {
                    return window.location.reload();
                  }

                  this.setState({
                    items: data,
                  });
                });
            }}
            className="absolute top-2 right-2 flex items-center justify-center p-1 rounded-full hover:bg-black/20 cursor-pointer transition text-white"
          >
            <X className="text-neutral-500 flex items-center justify-center" />
          </div>

          <div className="text-left w-full break-words">{item.text}</div>
        </div>
      </div>
    );
  }
}
