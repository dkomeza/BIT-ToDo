import { CSS } from "@dnd-kit/utilities";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToWindowEdges,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

function Lists() {
  const sensors = useSensors(useSensor(PointerSensor));

  const [lists, setLists] = useState([
    "Home",
    "Personal",
    "School",
    "Work",
    "Shopping",
  ]);

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLists((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="ml-2 flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges, restrictToVerticalAxis]}
      >
        <SortableContext items={lists} strategy={verticalListSortingStrategy}>
          {lists.map((list) => (
            <SortableItem key={list} id={list} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableItem({ id }: { id: string }) {
  const router = useNavigate();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="flex items-center justify-between hover:bg-accent mb-2 rounded-sm pr-2 cursor-pointer"
      ref={setNodeRef}
      style={style}
      onClick={() => {
        router(`/lists/${id}`);
      }}
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            console.log("CHuj");
            e.preventDefault();
            e.stopPropagation();
          }}
          {...listeners}
          {...attributes}
          style={{ backgroundColor: "transparent" }}
          className={`${id === "Home" ? "opacity-50 pointer-events-none" : ""}`}
        >
          <DragHandleDots2Icon className="text-muted-foreground" />
        </Button>
        <p className="text-lg font-bold ml-2">{id}</p>
      </div>
      <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
        99
      </div>
    </div>
  );
}

export default Lists;
