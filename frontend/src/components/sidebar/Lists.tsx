import { CSS } from "@dnd-kit/utilities";
import {
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
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useNavigate } from "react-router-dom";

import {
  DragHandleDots2Icon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { List, useToDoStore } from "@/stores/ToDoStore";
import NewList from "../NewList";
import { useRef, useState } from "react";
import useAnimate from "@/hooks/useAnimate";
import EditList from "../EditList";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";

function Lists({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { lists, changeListPriority } = useToDoStore();
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = lists.findIndex((list) => list.id === active.id);
      const newIndex = lists.findIndex((list) => list.id === over?.id);

      changeListPriority(oldIndex, newIndex);
    }
  }

  return (
    <div className="ml-2 flex flex-col">
      <HomeItem lists={lists} setOpenSheet={setOpen} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges, restrictToVerticalAxis]}
      >
        <SortableContext items={lists} strategy={verticalListSortingStrategy}>
          {lists.map(
            (list) =>
              list.slug !== "home" && (
                <SortableItem
                  key={list.slug}
                  list={list}
                  setOpenSheet={setOpen}
                />
              )
          )}
        </SortableContext>
      </DndContext>
      <NewList />
    </div>
  );
}

function SortableItem({
  list,
  setOpenSheet,
}: {
  list: List;
  setOpenSheet: (open: boolean) => void;
}) {
  const { removeList } = useToDoStore();
  const [open, setOpen] = useState(false);

  const router = useNavigate();

  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [left, animateLeft, setLeft] = useAnimate(0);
  const [isDragging, setIsDragging] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const onDragStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.ariaRoleDescription === "sortable") {
      return;
    }

    setStartX(e.touches[0].clientX - left);
    setIsDragging(true);
    setStartWidth(elementRef.current?.offsetWidth || 0);
  };

  const onDrag = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    const x = e.touches[0].clientX;

    const diff = x - startX;

    if (diff > 0) {
      setLeft(diff / 30);
      return;
    } else if (diff < -150) {
      const percentage = Math.abs(diff) / startWidth;
      setLeft(-0.8 * startWidth - percentage * 0.1 * startWidth);
      return;
    }

    setLeft(diff);
  };

  const onDragEnd = () => {
    if (left >= 0) {
      animateLeft(left, 0, 100);
    } else if (left < -150) {
      setOpen(true);
      animateLeft(left, 0, 200);
    } else if (left < -75) {
      animateLeft(left, -100, 100);
    } else {
      animateLeft(left, 0, 100);
    }

    setIsDragging(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="relative flex justify-end rounded-sm items-stretch overflow-x-clip"
          ref={elementRef}
        >
          <div
            className={`flex items-center justify-between mb-2 rounded-sm pr-2 cursor-pointer relative flex-grow w-full flex-shrink-0`}
            role="link"
            ref={setNodeRef}
            style={style}
            onClick={() => {
              router(`/${list.slug}`);
              setOpenSheet(false);
            }}
            onTouchStart={onDragStart}
            onTouchMove={onDrag}
            onTouchEnd={onDragEnd}
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
                <DragHandleDots2Icon className="text-muted-foreground pointer-events-none" />
              </Button>
              <p className="text-lg font-bold ml-2">{list.name}</p>
            </div>
            <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
              {list.tasks
                ? list.tasks.filter((task) => !task.completed).length
                : 0}
            </div>
          </div>
          <div
            className="flex-shrink-0"
            style={{
              width: `${-left}px`,
            }}
          >
            <EditList
              list={list}
              hideButtons={() => {
                animateLeft(left, 0, 100);
              }}
            >
              <div
                className={`${
                  left < -150 ? "w-full" : "w-1/2"
                } bg-red-500 rounded-sm absolute h-full right-0 transition-all`}
              >
                <Dialog
                  open={open}
                  onOpenChange={(isOpen) => {
                    setOpen(isOpen);
                  }}
                >
                  <DialogTrigger asChild>
                    <div
                      className="w-[50px] h-full flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <TrashIcon />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="flex w-auto flex-col rounded-md [&>button]:hidden p-4">
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-row justify-between gap-10 mt-2">
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            animateLeft(left, 0, 100);
                          }}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          removeList(list.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </EditList>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="">
        <ContextMenuItem
          asChild
          onClick={() => {
            setOpen(true);
          }}
        >
          <EditList list={list} hideButtons={() => {}}>
            <></>
          </EditList>
        </ContextMenuItem>
        <ContextMenuItem
          asChild
          onClick={() => {
            setOpen(true);
          }}
        >
          <Button
            variant="destructive"
            className="w-full mt-2 gap-2 justify-start"
          >
            <TrashIcon className="w-4 h-4" />
            Remove
          </Button>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function HomeItem({
  lists,
  setOpenSheet,
}: {
  lists: List[];
  setOpenSheet: (open: boolean) => void;
}) {
  const router = useNavigate();

  return (
    <div
      className="flex items-center justify-between mb-2 rounded-sm pr-2 cursor-pointer"
      role="link"
      onClick={() => {
        router(`/`);
        setOpenSheet(false);
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
        {lists
          .find((list) => list.slug === "home")
          ?.tasks.filter((task) => !task.completed).length || 0}
      </div>
    </div>
  );
}

export default Lists;
