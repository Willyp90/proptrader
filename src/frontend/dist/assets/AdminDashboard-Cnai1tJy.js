import { c as createLucideIcon, r as reactExports, o as useComposedRefs, m as useControllableState, j as jsxRuntimeExports, P as Primitive, n as composeEventHandlers, p as createContextScope, q as cn, w as useId, x as useCallbackRef, y as Presence, d as useActor, s as useQueryClient, e as useQuery, R as RiskLevel, z as useMutation, B as Button, S as Skeleton, C as ChallengeStatus, F as truncatePrincipal, f as createActor } from "./index-n7jmytJ0.js";
import { B as Badge } from "./badge-CnY4HZ9o.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-D-cSpQXq.js";
import { R as RefreshCw, D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-q59nD3lz.js";
import { L as Label, I as Input } from "./label-C63p0xgA.js";
import { b as usePrevious, a as useSize, c as createCollection, u as useDirection } from "./index-BFPRoASb.js";
import { u as ue } from "./index-BF_U0nn3.js";
import { T as TriangleAlert } from "./triangle-alert-DZL-It_Q.js";
import { C as CircleX, Z as Zap } from "./zap-DcHUhA89.js";
import { C as ChevronRight } from "./chevron-right-D5GIST7B.js";
import { C as ChevronDown } from "./chevron-down-OH-bWqiN.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const CircleCheckBig = createLucideIcon("circle-check-big", __iconNode);
var SWITCH_NAME = "Switch";
var [createSwitchContext] = createContextScope(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({
    __scopeSwitch,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var Root$1 = Switch$1;
var Thumb = SwitchThumb;
function Switch({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root$1,
    {
      "data-slot": "switch",
      className: cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Thumb,
        {
          "data-slot": "switch-thumb",
          className: cn(
            "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
          )
        }
      )
    }
  );
}
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection, useCollection, createCollectionScope] = createCollection(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME;
var RovingFocusGroupImpl = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = reactExports.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection(__scopeRovingFocusGroup);
  const isClickFocusRef = reactExports.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: reactExports.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: reactExports.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: reactExports.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: reactExports.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME = "RovingFocusGroupItem";
var RovingFocusGroupItem = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    reactExports.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collection.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root = RovingFocusGroup;
var Item = RovingFocusGroupItem;
var TABS_NAME = "Tabs";
var [createTabsContext] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: TABS_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs$1.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList$1.displayName = TAB_LIST_NAME;
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "TabsContent";
var TabsContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = reactExports.useRef(isSelected);
    reactExports.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent$1.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var Root2 = Tabs$1;
var List = TabsList$1;
var Trigger = TabsTrigger$1;
var Content = TabsContent$1;
function Tabs({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root2,
    {
      "data-slot": "tabs",
      className: cn("flex flex-col gap-2", className),
      ...props
    }
  );
}
function TabsList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    List,
    {
      "data-slot": "tabs-list",
      className: cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      ),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function TabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content,
    {
      "data-slot": "tabs-content",
      className: cn("flex-1 outline-none", className),
      ...props
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
function deriveParams(targetProfitPct, riskLevel) {
  const multiplier = targetProfitPct / 10;
  const base = riskLevel === RiskLevel.low ? { perTrade: 1, daily: 3, total: 5, baseFee: 0.5, perfFee: 10 } : riskLevel === RiskLevel.medium ? { perTrade: 2, daily: 5, total: 8, baseFee: 1, perfFee: 15 } : { perTrade: 3, daily: 8, total: 12, baseFee: 1.5, perfFee: 20 };
  return {
    perTradeLimitPct: Number.parseFloat(
      (base.perTrade * multiplier).toFixed(2)
    ),
    dailyDrawdownLimitPct: Number.parseFloat(
      (base.daily * multiplier).toFixed(2)
    ),
    totalDrawdownLimitPct: Number.parseFloat(
      (base.total * multiplier).toFixed(2)
    ),
    baseFee: Number.parseFloat((base.baseFee * multiplier).toFixed(4)),
    performanceFee: Number.parseFloat(base.perfFee.toFixed(2)),
    targetProfitPct,
    riskLevel,
    tradingPaused: false,
    updatedAt: BigInt(0)
  };
}
function statusBadge(status) {
  const map = {
    [ChallengeStatus.active]: "badge-simulated",
    [ChallengeStatus.passed]: "badge-success",
    [ChallengeStatus.failed]: "badge-destructive",
    [ChallengeStatus.paused]: "badge-warning"
  };
  return map[status] ?? "badge-warning";
}
function auditColor(action) {
  if (action.includes("SET_ADMIN") || action.includes("setAdminParams"))
    return "text-primary";
  if (action.includes("FORCE") || action.includes("forceChallenge"))
    return "text-accent";
  if (action.includes("PAUSE") || action.includes("setPauseTrading"))
    return "text-destructive";
  if (action.includes("RESUME")) return "text-chart-1";
  if (action.includes("OVERRIDE") || action.includes("overrideParams"))
    return "text-muted-foreground";
  return "text-muted-foreground";
}
function formatTs(ts) {
  return new Date(Number(ts) / 1e6).toLocaleString();
}
function pctColor(val) {
  return val >= 0 ? "text-chart-1" : "text-destructive";
}
function trackingPill(actual, target) {
  const ratio = target > 0 ? actual / target : 0;
  if (ratio >= 0.9)
    return {
      label: "On Track",
      cls: "bg-chart-1/20 text-chart-1 border-chart-1/40"
    };
  if (ratio >= 0.6)
    return {
      label: "Warning",
      cls: "bg-chart-3/20 text-chart-3 border-chart-3/40"
    };
  return {
    label: "Off Track",
    cls: "bg-destructive/20 text-destructive border-destructive/40"
  };
}
function defaultPhaseParams() {
  return {
    profitTarget: 8,
    maxDailyDrawdown: 4,
    maxTotalDrawdown: 8,
    minTradingDays: BigInt(5),
    timeLimitDays: BigInt(30),
    minConsistencyScore: 60
  };
}
function AdminDashboard() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const qc = useQueryClient();
  const { data: currentParams, isLoading: paramsLoading } = useQuery({
    queryKey: ["adminParams"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminParams();
    },
    enabled: !!actor && !actorLoading,
    staleTime: 3e4
  });
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ["allChallenges"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChallenges();
    },
    enabled: !!actor && !actorLoading,
    staleTime: 15e3
  });
  const { data: auditEntries = [], isLoading: auditLoading } = useQuery({
    queryKey: ["auditLog"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAuditLog(BigInt(100));
    },
    enabled: !!actor && !actorLoading,
    refetchInterval: 3e4,
    staleTime: 3e4
  });
  const { data: cohorts = [], isLoading: cohortsLoading } = useQuery({
    queryKey: ["allCohorts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCohorts();
    },
    enabled: !!actor && !actorLoading,
    staleTime: 3e4
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-6xl mx-auto", "data-ocid": "admin.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Admin Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Platform controls, risk parameters, and challenge management" })
      ] }),
      (currentParams == null ? void 0 : currentParams.tradingPaused) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-destructive/15 border border-destructive/40 text-destructive px-4 py-2 rounded-lg text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
        "TRADING PAUSED"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "parameters", "data-ocid": "admin.tab", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "parameters", "data-ocid": "admin.parameters.tab", children: "Parameters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "challenges", "data-ocid": "admin.challenges.tab", children: "Challenges" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "controls", "data-ocid": "admin.controls.tab", children: "Controls" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "audit", "data-ocid": "admin.audit.tab", children: "Audit Log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cohorts", "data-ocid": "admin.cohorts.tab", children: "Cohorts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "performance", "data-ocid": "admin.performance.tab", children: "Performance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "funded", "data-ocid": "admin.funded.tab", children: "Funded Traders" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "parameters", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ParametersTab,
        {
          actor,
          actorLoading,
          currentParams: currentParams ?? null,
          paramsLoading,
          onSuccess: () => qc.invalidateQueries({ queryKey: ["adminParams"] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "challenges", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ChallengesTab,
        {
          actor,
          actorLoading,
          challenges,
          isLoading: challengesLoading,
          onSuccess: () => qc.invalidateQueries({ queryKey: ["allChallenges"] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "controls", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ControlsTab,
        {
          actor,
          actorLoading,
          currentParams: currentParams ?? null,
          onSuccess: () => qc.invalidateQueries({ queryKey: ["adminParams"] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "audit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuditLogTab, { entries: auditEntries, isLoading: auditLoading }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cohorts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CohortsTab,
        {
          actor,
          actorLoading,
          cohorts,
          isLoading: cohortsLoading,
          onSuccess: () => qc.invalidateQueries({ queryKey: ["allCohorts"] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "performance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        PerformanceTab,
        {
          actor,
          actorLoading,
          cohorts,
          onSuccess: () => qc.invalidateQueries({ queryKey: ["allCohorts"] })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "funded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FundedTradersTab, { actor, actorLoading }) })
    ] })
  ] });
}
function ParametersTab({
  actor,
  actorLoading,
  currentParams,
  paramsLoading,
  onSuccess
}) {
  const [targetPct, setTargetPct] = reactExports.useState(10);
  const [riskLevel, setRiskLevel] = reactExports.useState(RiskLevel.medium);
  const [showOverride, setShowOverride] = reactExports.useState(false);
  const [overrideForm, setOverrideForm] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (currentParams) setOverrideForm(currentParams);
  }, [currentParams]);
  const derived = deriveParams(targetPct, riskLevel);
  const setParamsMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.setAdminParams(targetPct, riskLevel);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      ue.success("Parameters applied successfully");
      onSuccess();
    },
    onError: (e) => ue.error(`Failed: ${e.message}`)
  });
  const overrideMut = useMutation({
    mutationFn: async () => {
      if (!actor || !currentParams) throw new Error("No params loaded");
      const merged = { ...currentParams, ...overrideForm };
      const result = await actor.overrideParams(merged);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      ue.success("Override applied");
      onSuccess();
      setShowOverride(false);
    },
    onError: (e) => ue.error(`Override failed: ${e.message}`)
  });
  const riskOptions = [
    { label: "Low", value: RiskLevel.low },
    { label: "Medium", value: RiskLevel.medium },
    { label: "High", value: RiskLevel.high }
  ];
  const derivedFields = [
    { label: "Per-Trade Max Loss", val: derived.perTradeLimitPct, unit: "%" },
    {
      label: "Daily Drawdown Limit",
      val: derived.dailyDrawdownLimitPct,
      unit: "%"
    },
    {
      label: "Total Drawdown Limit",
      val: derived.totalDrawdownLimitPct,
      unit: "%"
    },
    { label: "Base Fee", val: derived.baseFee, unit: " ICP" },
    { label: "Performance Fee", val: derived.performanceFee, unit: "%" }
  ];
  const overrideKeys = [
    "targetProfitPct",
    "perTradeLimitPct",
    "dailyDrawdownLimitPct",
    "totalDrawdownLimitPct",
    "baseFee",
    "performanceFee"
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", "data-ocid": "admin.parameters.card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-display", children: "Dynamic Parameter Builder" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Target Profit %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price text-primary font-semibold", children: [
              targetPct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "range",
              min: 5,
              max: 100,
              step: 1,
              value: targetPct,
              onChange: (e) => setTargetPct(Number(e.target.value)),
              className: "w-full accent-primary h-2 rounded-full cursor-pointer",
              "data-ocid": "admin.target_profit.input"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "5%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "100%" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Risk Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", "data-ocid": "admin.risk_level.toggle", children: riskOptions.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setRiskLevel(value),
              "data-ocid": `admin.risk_level.${value}`,
              className: `flex-1 py-2 px-4 rounded-md text-sm font-semibold border transition-smooth ${riskLevel === value ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary/50"}`,
              children: label
            },
            value
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider font-medium", children: "Derived Parameters Preview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: derivedFields.map(({ label, val, unit }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "bg-muted/40 rounded-lg p-3 border border-border",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mono-price text-foreground font-semibold", children: [
                  val ?? "—",
                  unit
                ] })
              ]
            },
            label
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => setParamsMut.mutate(),
            disabled: setParamsMut.isPending || actorLoading,
            className: "w-full",
            "data-ocid": "admin.apply_params.primary_button",
            children: setParamsMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }),
              "Applying…"
            ] }) : "Apply Parameters"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-display", children: "Currently Deployed Parameters" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: paramsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: ["p1", "p2", "p3", "p4", "p5"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-full" }, k)) }) : currentParams ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: [
        {
          label: "Target Profit %",
          val: `${currentParams.targetProfitPct}%`
        },
        {
          label: "Per-Trade Limit",
          val: `${currentParams.perTradeLimitPct}%`
        },
        {
          label: "Daily Drawdown",
          val: `${currentParams.dailyDrawdownLimitPct}%`
        },
        {
          label: "Total Drawdown",
          val: `${currentParams.totalDrawdownLimitPct}%`
        },
        { label: "Base Fee", val: `${currentParams.baseFee} ICP` },
        {
          label: "Performance Fee",
          val: `${currentParams.performanceFee}%`
        },
        { label: "Risk Level", val: currentParams.riskLevel },
        { label: "Updated At", val: formatTs(currentParams.updatedAt) }
      ].map(({ label, val }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-muted/40 rounded-lg p-3 border border-border",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono-price text-foreground font-medium truncate", children: val })
          ]
        },
        label
      )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No parameters loaded." }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardHeader,
        {
          className: "cursor-pointer select-none",
          onClick: () => setShowOverride((v) => !v),
          "data-ocid": "admin.override.toggle",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Override Parameters (Advanced)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm font-normal", children: showOverride ? "▲ Hide" : "▼ Expand" })
          ] })
        }
      ),
      showOverride && /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: overrideKeys.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: field.replace(/([A-Z])/g, " $1").replace(/Pct$/, " %").trim() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.01",
              value: typeof overrideForm[field] === "number" ? overrideForm[field] : "",
              onChange: (e) => setOverrideForm((prev) => ({
                ...prev,
                [field]: Number.parseFloat(e.target.value)
              })),
              className: "font-mono text-sm",
              "data-ocid": `admin.override.${field}.input`
            }
          )
        ] }, field)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => overrideMut.mutate(),
            disabled: overrideMut.isPending || actorLoading,
            variant: "secondary",
            className: "w-full",
            "data-ocid": "admin.override.submit_button",
            children: overrideMut.isPending ? "Applying Override…" : "Apply Override"
          }
        )
      ] })
    ] })
  ] });
}
function ChallengesTab({
  actor,
  actorLoading,
  challenges,
  isLoading,
  onSuccess
}) {
  const [filter, setFilter] = reactExports.useState("all");
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [selectedChallenge, setSelectedChallenge] = reactExports.useState(
    null
  );
  const [forceStatus, setForceStatus] = reactExports.useState(ChallengeStatus.passed);
  const [reason, setReason] = reactExports.useState("");
  const filtered = challenges.filter(
    (c) => filter === "all" || c.status === filter
  );
  const forceMut = useMutation({
    mutationFn: async () => {
      if (!actor || !selectedChallenge) throw new Error("Actor not ready");
      const result = await actor.forceChallenge(
        selectedChallenge.id,
        forceStatus,
        reason
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      ue.success(
        `Challenge ${forceStatus === ChallengeStatus.passed ? "passed" : "failed"} successfully`
      );
      onSuccess();
      setDialogOpen(false);
      setReason("");
    },
    onError: (e) => ue.error(`Failed: ${e.message}`)
  });
  function openDialog(c, status) {
    setSelectedChallenge(c);
    setForceStatus(status);
    setReason("");
    setDialogOpen(true);
  }
  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: ChallengeStatus.active },
    { label: "Passed", value: ChallengeStatus.passed },
    { label: "Failed", value: ChallengeStatus.failed }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", "data-ocid": "admin.challenges.section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", "data-ocid": "admin.challenges.filter", children: filterOptions.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        size: "sm",
        variant: filter === value ? "default" : "outline",
        onClick: () => setFilter(value),
        "data-ocid": `admin.challenges.filter.${value}`,
        children: label
      },
      value
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-3", children: ["c1", "c2", "c3", "c4"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, k)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "p-12 text-center text-muted-foreground text-sm",
        "data-ocid": "admin.challenges.empty_state",
        children: "No challenges match this filter."
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Trader" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Start Bal." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Current" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "P&L %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Drawdown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-center", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Days" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-center", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filtered.map((c, idx) => {
        const pnlPct = c.startingBalance > 0 ? (c.currentBalance - c.startingBalance) / c.startingBalance * 100 : 0;
        const drawdownPct = c.startingBalance > 0 ? Math.min(
          0,
          (c.currentBalance - c.startingBalance) / c.startingBalance * 100
        ) : 0;
        const daysElapsed = Math.max(
          0,
          Math.floor(
            (Date.now() - Number(c.startTime) / 1e6) / 864e5
          )
        );
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "border-b border-border/50 hover:bg-muted/20 transition-colors",
            "data-ocid": `admin.challenges.item.${idx + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: truncatePrincipal(c.traderPrincipal.toText()) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right mono-price", children: [
                "$",
                c.startingBalance.toLocaleString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right mono-price", children: [
                "$",
                c.currentBalance.toLocaleString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "td",
                {
                  className: `px-4 py-3 text-right mono-price font-semibold ${pctColor(pnlPct)}`,
                  children: [
                    pnlPct >= 0 ? "+" : "",
                    pnlPct.toFixed(2),
                    "%"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right mono-price text-destructive", children: [
                drawdownPct.toFixed(2),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: statusBadge(c.status), children: c.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right mono-price text-muted-foreground", children: [
                daysElapsed,
                "d"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "text-chart-1 border-primary/30 hover:bg-primary/10 text-xs h-7 px-2",
                    onClick: () => openDialog(c, ChallengeStatus.passed),
                    "data-ocid": `admin.challenges.force_pass.${idx + 1}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3 mr-1" }),
                      "Pass"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "text-destructive border-destructive hover:bg-destructive/10 text-xs h-7 px-2",
                    onClick: () => openDialog(c, ChallengeStatus.failed),
                    "data-ocid": `admin.challenges.force_fail.${idx + 1}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3 mr-1" }),
                      "Fail"
                    ]
                  }
                )
              ] }) })
            ]
          },
          String(c.id)
        );
      }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: dialogOpen,
        onOpenChange: (o) => {
          setDialogOpen(o);
          if (!o) setReason("");
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "bg-card border-border",
            "data-ocid": "admin.force_challenge.dialog",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display", children: [
                "Force ",
                forceStatus === ChallengeStatus.passed ? "Pass" : "Fail",
                " ",
                "Challenge"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
                selectedChallenge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/30 rounded-lg p-3 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Trader: " }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: truncatePrincipal(
                    selectedChallenge.traderPrincipal.toText()
                  ) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
                    "Reason ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "(required)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      placeholder: "Provide a reason for this override…",
                      value: reason,
                      onChange: (e) => setReason(e.target.value),
                      rows: 3,
                      className: "resize-none",
                      "data-ocid": "admin.force_challenge.reason.textarea"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    onClick: () => setDialogOpen(false),
                    "data-ocid": "admin.force_challenge.cancel_button",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    disabled: !reason.trim() || forceMut.isPending || actorLoading,
                    onClick: () => forceMut.mutate(),
                    className: forceStatus === ChallengeStatus.passed ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                    "data-ocid": "admin.force_challenge.confirm_button",
                    children: forceMut.isPending ? "Processing…" : `Confirm ${forceStatus === ChallengeStatus.passed ? "Pass" : "Fail"}`
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] });
}
function ControlsTab({
  actor,
  actorLoading,
  currentParams,
  onSuccess
}) {
  const isPaused = (currentParams == null ? void 0 : currentParams.tradingPaused) ?? false;
  const toggleMut = useMutation({
    mutationFn: async (paused) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.setPauseTrading(paused);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: (_, paused) => {
      ue.success(paused ? "Trading paused" : "Trading resumed");
      onSuccess();
    },
    onError: (e) => ue.error(`Failed: ${e.message}`)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.controls.section", children: [
    isPaused && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 bg-destructive/10 border border-destructive/40 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-destructive shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive font-semibold text-sm", children: "Trading is currently PAUSED" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive/70 text-xs mt-0.5", children: "All traders are blocked from submitting new orders until trading is resumed." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-display font-semibold", children: [
          "Trading ",
          isPaused ? "Paused" : "Active"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground max-w-sm", children: [
          "Pausing trading blocks",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "ALL traders" }),
          " from submitting new orders. Use with caution."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `text-sm font-medium ${!isPaused ? "text-chart-1" : "text-muted-foreground"}`,
            children: "Active"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: isPaused,
            onCheckedChange: (checked) => toggleMut.mutate(checked),
            disabled: toggleMut.isPending || actorLoading,
            className: "scale-125 data-[state=checked]:bg-destructive",
            "data-ocid": "admin.trading_pause.switch"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `text-sm font-medium ${isPaused ? "text-destructive" : "text-muted-foreground"}`,
            children: "Paused"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Badge,
        {
          variant: "outline",
          className: `px-4 py-1.5 text-sm font-semibold ${isPaused ? "border-destructive/50 text-destructive bg-destructive/10" : "border-primary/50 text-chart-1 bg-primary/10"}`,
          "data-ocid": "admin.trading_status.badge",
          children: isPaused ? "⏸ Trading Paused" : "▶ Trading Active"
        }
      ),
      toggleMut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-muted-foreground text-sm flex items-center gap-2",
          "data-ocid": "admin.trading_pause.loading_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }),
            "Updating trading state…"
          ]
        }
      )
    ] }) }) })
  ] });
}
function AuditLogTab({
  entries,
  isLoading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "admin.audit.section", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-display", children: "Audit Log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3 h-3" }),
        "Auto-refreshes every 30s"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-3", children: ["a1", "a2", "a3", "a4", "a5"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, k)) }) : entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "p-12 text-center text-muted-foreground text-sm",
        "data-ocid": "admin.audit.empty_state",
        children: "No audit entries yet."
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[600px] overflow-y-auto divide-y divide-border/50", children: entries.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 px-4 py-3 hover:bg-muted/20 transition-colors",
        "data-ocid": `admin.audit.item.${idx + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground shrink-0 pt-0.5 min-w-[140px]", children: formatTs(entry.timestamp) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `font-semibold text-sm shrink-0 min-w-[160px] ${auditColor(entry.action)}`,
              children: entry.action
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground shrink-0 min-w-[80px]", children: truncatePrincipal(entry.principal.toText()) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/80 min-w-0 break-words", children: entry.details })
        ]
      },
      `${String(entry.timestamp)}-${entry.action}-${idx}`
    )) }) })
  ] }) });
}
function PhaseParamsForm({
  label,
  value,
  onChange,
  ocidPrefix
}) {
  function update(field, raw) {
    const isBigInt = field === "minTradingDays" || field === "timeLimitDays";
    onChange({
      ...value,
      [field]: isBigInt ? BigInt(Number.parseInt(raw, 10) || 0) : Number.parseFloat(raw) || 0
    });
  }
  const fields = [
    { key: "profitTarget", label: "Profit Target %", step: "0.1" },
    { key: "maxDailyDrawdown", label: "Max Daily Drawdown %", step: "0.1" },
    { key: "maxTotalDrawdown", label: "Max Total Drawdown %", step: "0.1" },
    { key: "minTradingDays", label: "Min Trading Days", step: "1" },
    { key: "timeLimitDays", label: "Time Limit Days", step: "1" },
    { key: "minConsistencyScore", label: "Min Consistency Score %", step: "1" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider font-semibold", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: fields.map(({ key, label: fl, step }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: fl }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          step,
          value: typeof value[key] === "bigint" ? String(value[key]) : String(value[key]),
          onChange: (e) => update(key, e.target.value),
          className: "font-mono text-sm h-8",
          "data-ocid": `${ocidPrefix}.${key}.input`
        }
      )
    ] }, key)) })
  ] });
}
function CohortsTab({
  actor,
  actorLoading,
  cohorts,
  isLoading,
  onSuccess
}) {
  const [showCreate, setShowCreate] = reactExports.useState(false);
  const [editCohort, setEditCohort] = reactExports.useState(null);
  const [createName, setCreateName] = reactExports.useState("");
  const [createP1, setCreateP1] = reactExports.useState(defaultPhaseParams());
  const [createP2, setCreateP2] = reactExports.useState({
    ...defaultPhaseParams(),
    profitTarget: 5,
    timeLimitDays: BigInt(60),
    minConsistencyScore: 65
  });
  const [editP1, setEditP1] = reactExports.useState(defaultPhaseParams());
  const [editP2, setEditP2] = reactExports.useState(defaultPhaseParams());
  reactExports.useEffect(() => {
    if (editCohort) {
      setEditP1(editCohort.phase1);
      setEditP2(editCohort.phase2);
    }
  }, [editCohort]);
  const createMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      if (!createName.trim()) throw new Error("Cohort name is required");
      const result = await actor.createCohort(
        createName.trim(),
        createP1,
        createP2
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      ue.success("Cohort created successfully");
      onSuccess();
      setShowCreate(false);
      setCreateName("");
      setCreateP1(defaultPhaseParams());
      setCreateP2({
        ...defaultPhaseParams(),
        profitTarget: 5,
        timeLimitDays: BigInt(60),
        minConsistencyScore: 65
      });
    },
    onError: (e) => ue.error(`Failed: ${e.message}`)
  });
  const updateMut = useMutation({
    mutationFn: async () => {
      if (!actor || !editCohort) throw new Error("Actor not ready");
      const result = await actor.updateCohortParams(
        editCohort.id,
        editP1,
        editP2
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      ue.success("Cohort updated — applies to new challenges only");
      onSuccess();
      setEditCohort(null);
    },
    onError: (e) => ue.error(`Failed: ${e.message}`)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.cohorts.section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-display", children: "All Cohorts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            onClick: () => setShowCreate((v) => !v),
            "data-ocid": "admin.cohorts.create.open_modal_button",
            children: showCreate ? "Cancel" : "+ New Cohort"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-3", children: ["c1", "c2", "c3"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, k)) }) : cohorts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "p-12 text-center text-muted-foreground text-sm",
          "data-ocid": "admin.cohorts.empty_state",
          children: "No cohorts yet. Create one to get started."
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-center", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "P1 Target" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "P2 Target" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Created" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-center", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: cohorts.map((c, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "border-b border-border/50 hover:bg-muted/20 transition-colors",
            "data-ocid": `admin.cohorts.item.${idx + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-foreground", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: c.active ? "badge-success" : "badge-warning",
                  children: c.active ? "Active" : "Archived"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right mono-price", children: [
                c.phase1.profitTarget,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right mono-price", children: [
                c.phase2.profitTarget,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-muted-foreground text-xs", children: formatTs(c.createdDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "text-xs h-7 px-3",
                  onClick: () => setEditCohort(c),
                  "data-ocid": `admin.cohorts.edit.${idx + 1}`,
                  children: "Edit Params"
                }
              ) })
            ]
          },
          String(c.id)
        )) })
      ] }) }) })
    ] }),
    showCreate && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Card,
      {
        className: "bg-card border-border border-primary/30",
        "data-ocid": "admin.cohorts.create.panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-display", children: "Create New Cohort" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Cohort Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "e.g. Q2 2026 Cohort",
                  value: createName,
                  onChange: (e) => setCreateName(e.target.value),
                  "data-ocid": "admin.cohorts.create.name.input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                PhaseParamsForm,
                {
                  label: "Phase 1 — Evaluation",
                  value: createP1,
                  onChange: setCreateP1,
                  ocidPrefix: "admin.cohorts.create.p1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                PhaseParamsForm,
                {
                  label: "Phase 2 — Verification",
                  value: createP2,
                  onChange: setCreateP2,
                  ocidPrefix: "admin.cohorts.create.p2"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => createMut.mutate(),
                disabled: createMut.isPending || actorLoading || !createName.trim(),
                className: "w-full",
                "data-ocid": "admin.cohorts.create.submit_button",
                children: createMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }),
                  "Creating…"
                ] }) : "Create Cohort"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: !!editCohort,
        onOpenChange: (o) => !o && setEditCohort(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto",
            "data-ocid": "admin.cohorts.edit.dialog",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display", children: [
                "Edit Cohort: ",
                editCohort == null ? void 0 : editCohort.name
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 space-y-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-primary shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary/90", children: "Parameter changes apply to new challenges only — existing challenges keep their original terms." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    PhaseParamsForm,
                    {
                      label: "Phase 1 — Evaluation",
                      value: editP1,
                      onChange: setEditP1,
                      ocidPrefix: "admin.cohorts.edit.p1"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    PhaseParamsForm,
                    {
                      label: "Phase 2 — Verification",
                      value: editP2,
                      onChange: setEditP2,
                      ocidPrefix: "admin.cohorts.edit.p2"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    onClick: () => setEditCohort(null),
                    "data-ocid": "admin.cohorts.edit.cancel_button",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: () => updateMut.mutate(),
                    disabled: updateMut.isPending || actorLoading,
                    "data-ocid": "admin.cohorts.edit.confirm_button",
                    children: updateMut.isPending ? "Saving…" : "Save Changes"
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] });
}
function PerformanceTab({
  actor,
  actorLoading,
  cohorts,
  onSuccess
}) {
  const [selectedCohortId, setSelectedCohortId] = reactExports.useState(null);
  const [passRateTarget, setPassRateTarget] = reactExports.useState(60);
  const [returnTarget, setReturnTarget] = reactExports.useState(15);
  const [consistencyTarget, setConsistencyTarget] = reactExports.useState(65);
  const cohortId = selectedCohortId ?? (cohorts.length > 0 ? cohorts[0].id : null);
  reactExports.useEffect(() => {
    if (!selectedCohortId && cohorts.length > 0) {
      setSelectedCohortId(cohorts[0].id);
    }
  }, [cohorts, selectedCohortId]);
  const { data: targetOutcome, isLoading: outcomeLoading } = useQuery({
    queryKey: ["targetOutcomes", String(cohortId)],
    queryFn: async () => {
      if (!actor || cohortId === null) return null;
      const result = await actor.getTargetOutcomes(cohortId);
      if (result.__kind__ === "err") return null;
      return result.ok;
    },
    enabled: !!actor && !actorLoading && cohortId !== null,
    staleTime: 3e4
  });
  const { data: suggestions = [], isLoading: suggestLoading } = useQuery({
    queryKey: ["suggestAdjustments", String(cohortId)],
    queryFn: async () => {
      if (!actor || cohortId === null) return [];
      const result = await actor.suggestParamAdjustments(cohortId);
      if (result.__kind__ === "err") return [];
      return result.ok;
    },
    enabled: !!actor && !actorLoading && cohortId !== null,
    staleTime: 6e4
  });
  const { data: payoutStats, isLoading: payoutLoading } = useQuery({
    queryKey: ["payoutStats"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getPayoutStats();
      if (result.__kind__ === "err") return null;
      return result.ok;
    },
    enabled: !!actor && !actorLoading,
    staleTime: 6e4
  });
  const setTargetMut = useMutation({
    mutationFn: async () => {
      if (!actor || cohortId === null) throw new Error("Select a cohort first");
      const result = await actor.setTargetOutcomes(
        cohortId,
        passRateTarget,
        returnTarget,
        consistencyTarget
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      ue.success("Target outcomes saved");
      onSuccess();
    },
    onError: (e) => ue.error(`Failed: ${e.message}`)
  });
  const applyMut = useMutation({
    mutationFn: async (_s) => {
      if (!actor || cohortId === null) throw new Error("No cohort");
      const currentCohort = cohorts.find((c) => c.id === cohortId);
      if (!currentCohort) throw new Error("Cohort not found");
      const result = await actor.updateCohortParams(
        cohortId,
        currentCohort.phase1,
        currentCohort.phase2
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      ue.success("Suggestion applied");
      onSuccess();
    },
    onError: (e) => ue.error(`Failed: ${e.message}`)
  });
  reactExports.useEffect(() => {
    if (targetOutcome) {
      setPassRateTarget(targetOutcome.passRateTarget);
      setReturnTarget(targetOutcome.returnTarget);
      setConsistencyTarget(targetOutcome.consistencyTarget);
    }
  }, [targetOutcome]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.performance.section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: payoutLoading ? ["m1", "m2", "m3"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full" }, k)) : payoutStats ? [
      {
        label: "Total Trader Payouts",
        val: payoutStats.totalTraderPayouts,
        color: "text-chart-1"
      },
      {
        label: "Total Investor Payouts",
        val: payoutStats.totalInvestorPayouts,
        color: "text-primary"
      },
      {
        label: "Platform Revenue",
        val: payoutStats.totalPlatformRevenue,
        color: "text-accent"
      }
    ].map(({ label, val, color }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-5 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mono-lg font-bold ${color}`, children: [
        val.toFixed(4),
        " ICP"
      ] })
    ] }) }, label)) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "col-span-3 text-sm text-muted-foreground",
        "data-ocid": "admin.performance.payouts.empty_state",
        children: "No payout data available."
      }
    ) }),
    cohorts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-display", children: "Target Outcomes" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Select Cohort" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: String(cohortId ?? ""),
              onChange: (e) => setSelectedCohortId(BigInt(e.target.value)),
              className: "w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              "data-ocid": "admin.performance.cohort.select",
              children: cohorts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(c.id), children: [
                c.name,
                " ",
                c.active ? "(Active)" : "(Archived)"
              ] }, String(c.id)))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          {
            label: "Pass Rate Target %",
            val: passRateTarget,
            set: setPassRateTarget,
            actual: (targetOutcome == null ? void 0 : targetOutcome.actualPassRate) ?? 0,
            ocid: "admin.performance.passrate.input"
          },
          {
            label: "Return Target %",
            val: returnTarget,
            set: setReturnTarget,
            actual: (targetOutcome == null ? void 0 : targetOutcome.actualReturn) ?? 0,
            ocid: "admin.performance.return.input"
          },
          {
            label: "Consistency Target %",
            val: consistencyTarget,
            set: setConsistencyTarget,
            actual: (targetOutcome == null ? void 0 : targetOutcome.actualConsistency) ?? 0,
            ocid: "admin.performance.consistency.input"
          }
        ].map(({ label, val, set, actual, ocid }) => {
          const pill = trackingPill(actual, val);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "1",
                min: "0",
                max: "100",
                value: val,
                onChange: (e) => set(Number.parseFloat(e.target.value) || 0),
                className: "font-mono",
                "data-ocid": ocid
              }
            ),
            outcomeLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24" }) : targetOutcome ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "Actual: ",
                actual.toFixed(1),
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-xs px-2 py-0.5 rounded-full border font-semibold ${pill.cls}`,
                  children: pill.label
                }
              )
            ] }) : null
          ] }, label);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => setTargetMut.mutate(),
            disabled: setTargetMut.isPending || actorLoading || cohortId === null,
            className: "w-full",
            "data-ocid": "admin.performance.set_targets.submit_button",
            children: setTargetMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }),
              "Saving…"
            ] }) : "Save Target Outcomes"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-display flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 text-accent" }),
          "Suggested Adjustments"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "AI-assisted recommendations" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: suggestLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-3", children: ["s1", "s2", "s3"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, k)) }) : suggestions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "p-8 text-center text-muted-foreground text-sm",
          "data-ocid": "admin.performance.suggestions.empty_state",
          children: cohortId === null ? "Select a cohort to see suggestions." : "No adjustment suggestions at this time — parameters look healthy."
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/50", children: suggestions.map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 hover:bg-muted/20 transition-colors",
          "data-ocid": `admin.performance.suggestion.item.${idx + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground", children: s.metric }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: s.reason })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Current" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono-price text-foreground", children: s.current.toFixed(1) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Suggested" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mono-price text-primary font-semibold", children: s.suggested.toFixed(1) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "text-xs h-7 px-3 border-primary/40 text-primary hover:bg-primary/10",
                  onClick: () => applyMut.mutate(s),
                  disabled: applyMut.isPending || actorLoading,
                  "data-ocid": `admin.performance.suggestion.apply.${idx + 1}`,
                  children: "Apply"
                }
              )
            ] })
          ]
        },
        `${s.metric}-${idx}`
      )) }) })
    ] })
  ] });
}
function FundedTradersTab({
  actor,
  actorLoading
}) {
  const [expandedTrader, setExpandedTrader] = reactExports.useState(null);
  const [reviewModalOpen, setReviewModalOpen] = reactExports.useState(false);
  const [reviewResult, setReviewResult] = reactExports.useState(null);
  const { data: traders = [], isLoading } = useQuery({
    queryKey: ["fundedTraderList"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFundedTraderList();
    },
    enabled: !!actor && !actorLoading,
    staleTime: 3e4
  });
  const reviewMut = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.triggerMonthlyReview();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (data) => {
      setReviewResult(data);
      setReviewModalOpen(true);
      ue.success(
        `Monthly review complete: ${data.reviewedCount} traders updated`
      );
    },
    onError: (e) => ue.error(`Review failed: ${e.message}`)
  });
  function statusColor(status) {
    if (status === "active") return "badge-success";
    if (status === "suspended") return "badge-destructive";
    return "badge-warning";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", "data-ocid": "admin.funded.section", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground", children: "Funded Traders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          traders.length,
          " active funded account",
          traders.length !== 1 ? "s" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => reviewMut.mutate(),
          disabled: reviewMut.isPending || actorLoading,
          variant: "secondary",
          "data-ocid": "admin.funded.monthly_review.button",
          children: reviewMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }),
            "Running Review…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
            "Trigger Monthly Review"
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-3", children: ["t1", "t2", "t3"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }, k)) }) : traders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "p-12 text-center text-muted-foreground text-sm",
        "data-ocid": "admin.funded.empty_state",
        children: "No funded traders yet. Traders must pass both challenge phases."
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/50", children: traders.map((t, idx) => {
      const traderId = t.traderId.toText();
      const isExpanded = expandedTrader === traderId;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        FundedTraderRow,
        {
          trader: t,
          idx,
          isExpanded,
          actor,
          actorLoading,
          statusColor,
          onToggle: () => setExpandedTrader(isExpanded ? null : traderId)
        },
        traderId
      );
    }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: reviewModalOpen, onOpenChange: setReviewModalOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent,
      {
        className: "bg-card border-border max-w-lg",
        "data-ocid": "admin.funded.review.dialog",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display", children: "Monthly Review Complete" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2 space-y-4", children: reviewResult && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 border border-primary/30 rounded-lg p-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-primary font-semibold text-lg mono-lg", children: [
              String(reviewResult.reviewedCount),
              " traders updated"
            ] }) }),
            reviewResult.changes.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-64 overflow-y-auto divide-y divide-border/50", children: reviewResult.changes.map((change) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "py-2 px-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: truncatePrincipal(change.traderId.toText()) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mono-price text-muted-foreground", children: [
                        change.oldAllocation.toFixed(2),
                        " ICP"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3 text-muted-foreground" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "span",
                        {
                          className: `mono-price font-semibold ${change.newAllocation > change.oldAllocation ? "text-chart-1" : "text-destructive"}`,
                          children: [
                            change.newAllocation.toFixed(2),
                            " ICP"
                          ]
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: change.reason })
                ]
              },
              `${change.traderId.toText()}-${String(change.timestamp)}`
            )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "No allocation changes were made." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => setReviewModalOpen(false),
              "data-ocid": "admin.funded.review.close_button",
              children: "Close"
            }
          ) })
        ]
      }
    ) })
  ] });
}
function FundedTraderRow({
  trader,
  idx,
  isExpanded,
  actor,
  actorLoading,
  statusColor,
  onToggle
}) {
  const { data: allocation, isLoading: allocLoading } = useQuery({
    queryKey: ["traderAllocation", trader.traderId.toText()],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getTraderAllocation(trader.traderId);
      if (result.__kind__ === "err") return null;
      return result.ok;
    },
    enabled: !!actor && !actorLoading && isExpanded,
    staleTime: 3e4
  });
  const consistencyColor = trader.consistencyScore >= 80 ? "text-chart-1" : trader.consistencyScore >= 60 ? "text-accent" : "text-destructive";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "w-full flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-4 hover:bg-muted/20 transition-colors cursor-pointer text-left",
        onClick: onToggle,
        "data-ocid": `admin.funded.item.${idx + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", "aria-hidden": "true", children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground truncate", children: trader.username || truncatePrincipal(trader.traderId.toText()) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-muted-foreground", children: truncatePrincipal(trader.traderId.toText()) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 sm:gap-6 text-sm shrink-0 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Allocation" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mono-price font-semibold text-foreground", children: [
                trader.allocation.toFixed(2),
                " ICP"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Consistency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mono-price font-semibold ${consistencyColor}`, children: [
                trader.consistencyScore.toFixed(1),
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Monthly Return" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "p",
                {
                  className: `mono-price font-semibold ${trader.monthlyReturn >= 0 ? "text-chart-1" : "text-destructive"}`,
                  children: [
                    trader.monthlyReturn >= 0 ? "+" : "",
                    trader.monthlyReturn.toFixed(2),
                    "%"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: statusColor(trader.status), children: trader.status })
          ] })
        ]
      }
    ),
    isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pb-4 bg-muted/10 border-b border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3", children: "Allocation History" }),
      allocLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: ["h1", "h2", "h3"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" }, k)) }) : allocation ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-lg p-3 border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Base" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mono-price font-semibold", children: [
              allocation.base.toFixed(2),
              " ICP"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-lg p-3 border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Current" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mono-price font-semibold text-primary", children: [
              allocation.current.toFixed(2),
              " ICP"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-lg p-3 border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Multiplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mono-price font-semibold text-accent", children: [
              allocation.multiplier.toFixed(2),
              "×"
            ] })
          ] })
        ] }),
        allocation.history.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/30 max-h-48 overflow-y-auto", children: allocation.history.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 py-2 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground min-w-[120px]", children: formatTs(h.timestamp) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mono-price", children: h.oldAllocation.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `mono-price font-semibold ${h.newAllocation > h.oldAllocation ? "text-chart-1" : "text-destructive"}`,
                  children: h.newAllocation.toFixed(2)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground flex-1 truncate", children: h.reason })
            ]
          },
          `${String(h.timestamp)}-${h.oldAllocation}`
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No allocation history yet." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          className: "text-xs text-muted-foreground",
          "data-ocid": "admin.funded.allocation.error_state",
          children: "Could not load allocation data."
        }
      )
    ] })
  ] });
}
export {
  AdminDashboard as default
};
