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

import { useNavigate } from "react-router-dom";

import { DragHandleDots2Icon, PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { List, useToDoStore } from "@/stores/ToDoStore";
import NewList from "../NewList";

function Lists() {
  const { lists } = useToDoStore();
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: any) {
    // TODO: Fix any type and implement this function
    const { active, over } = event;

    if (active.id !== over.id) {
      // setLists((items) => {
      //   const oldIndex = items.indexOf(active.id);
      //   const newIndex = items.indexOf(over.id);
      //   return arrayMove(items, oldIndex, newIndex);
      // });
    }
  }

  return (
    <div className="ml-2 flex flex-col">
      <HomeItem lists={lists} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges, restrictToVerticalAxis]}
      >
        <SortableContext items={lists} strategy={verticalListSortingStrategy}>
          {lists.map((list) => (
            <SortableItem key={list.slug} list={list} />
          ))}
        </SortableContext>
      </DndContext>
      <NewList />
    </div>
  );
}

function SortableItem({ list }: { list: List }) {
  const router = useNavigate();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: list.id });

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
        router(`/${list.slug}`);
      }}
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          {...listeners}
          {...attributes}
          style={{ backgroundColor: "transparent" }}
        >
          <DragHandleDots2Icon className="text-muted-foreground" />
        </Button>
        <p className="text-lg font-bold ml-2">{list.name}</p>
      </div>
      <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
        99
      </div>
    </div>
  );
}

function HomeItem({ lists }: { lists: List[] }) {
  const router = useNavigate();

  return (
    <div
      className="flex items-center justify-between hover:bg-accent mb-2 rounded-sm pr-2 cursor-pointer"
      onClick={() => {
        router(`/`);
      }}
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{ backgroundColor: "transparent" }}
          className={"opacity-50 pointer-events-none"}
        >
          <DragHandleDots2Icon className="text-muted-foreground" />
        </Button>
        <p className="text-lg font-bold ml-2">Home</p>
      </div>
      <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
        {lists.reduce((acc, list) => {
          return acc + (list.tasks ? list.tasks.length : 0);
        }, 0)}
      </div>
    </div>
  );
}

export default Lists;
