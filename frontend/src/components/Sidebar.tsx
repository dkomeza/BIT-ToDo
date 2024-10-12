import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import {
  DragHandleDots2Icon,
  HamburgerMenuIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import AccountDropdown from "./AccountDropdown";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const [lists, setLists] = useState([
    "Home",
    "Personal",
    "School",
    "Work",
    "Shopping",
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <Sheet>
      <div className="flex justify-between">
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <HamburgerMenuIcon />
          </Button>
        </SheetTrigger>

        <Button variant="outline" size="icon">
          <PlusIcon />
        </Button>
      </div>

      <SheetContent side={"left"}>
        <SheetHeader className="mt-6">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" className="block w-14" alt="" />
              <div className="flex flex-col items-start">
                <h2 className="text-2xl font-extrabold">BIT-ToDo</h2>
                <p className="text-muted-foreground text-sm font-light">
                  Dawid Komęza
                </p>
              </div>
            </div>
            <AccountDropdown />
          </SheetTitle>
          <SheetDescription>Manage your tasks with ease</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-8 pl-2">
          <h3 className="text-2xl font-bold">Lists</h3>
          <div className="ml-2 flex flex-col">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToWindowEdges, restrictToVerticalAxis]}
            >
              <SortableContext
                items={lists}
                strategy={verticalListSortingStrategy}
              >
                {lists.map((list) => (
                  <SortableItem key={list} id={list} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

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

export default Sidebar;
