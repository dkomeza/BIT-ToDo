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
  DotsHorizontalIcon,
  DragHandleDots2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { List, useToDoStore } from "@/stores/ToDoStore";
import NewList from "../NewList";
import { useRef, useState } from "react";
import useAnimate from "@/hooks/useAnimate";
import EditList from "../EditList";

function Lists() {
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
  const { removeList } = useToDoStore();

  const router = useNavigate();
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [left, animateLeft, setLeft] = useAnimate(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const onDragStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setStartX(e.touches[0].clientX - left);
    setStartWidth(elementRef.current?.offsetWidth || 0);
  };

  const onDrag = (e: React.TouchEvent<HTMLDivElement>) => {
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
      removeList(list.id);
      setLeft(0);
    } else if (left < -75) {
      animateLeft(left, -100, 100);
    } else {
      animateLeft(left, 0, 100);
    }
  };

  return (
    <div
      className="relative overflow-hidden flex justify-end rounded-sm items-stretch"
      ref={elementRef}
    >
      <div
        className={`flex items-center justify-between mb-2 rounded-sm pr-2 cursor-pointer relative flex-grow w-full flex-shrink-0`}
        role="link"
        ref={setNodeRef}
        style={style}
        onClick={() => {
          router(`/${list.slug}`);
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
            <DragHandleDots2Icon className="text-muted-foreground" />
          </Button>
          <p className="text-lg font-bold ml-2">{list.name}</p>
        </div>
        <div className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs rounded-sm">
          99
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
            <div
              className="w-[50px] h-full flex items-center justify-center"
              onClick={() => {
                removeList(list.id);
              }}
            >
              <TrashIcon />
            </div>
          </div>
        </EditList>
      </div>
    </div>
  );
}

function HomeItem({ lists }: { lists: List[] }) {
  const router = useNavigate();

  return (
    <div
      className="flex items-center justify-between mb-2 rounded-sm pr-2 cursor-pointer"
      role="link"
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
