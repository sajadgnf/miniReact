const createElement = (type, props, ...children) => {
  return { type, props: { ...props, children } };
};

const createDom = (element) => {
  if (typeof element === "string" || typeof element === "number") {
    return document.createTextNode(element);
  }

  if (typeof element.type === "function") {
    return createDom(element.type(element.props));
  }
  const dom = document.createElement(element.type);

  Object.entries(element.props).forEach(([key, value]) => {
    if (key === "children")
      value.forEach((child) => dom.appendChild(createDom(child)));
    else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      dom.addEventListener(eventName, value);
    } else dom[key] = value;
  });

  return dom;
};

const reconcileChildren = (parentDom, oldChildren, newChildren) => {

  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    reconcile(
      parentDom,
      oldChildren[i] ?? null,
      newChildren[i] ?? null,
      i
    );
  }
  return newChildren;
};


const updateProps = (dom, oldProps, newProps) => {
  Object.entries(oldProps).forEach(([key, value]) => {
    if (key === "children") {
      return reconcileChildren(dom, value, newProps.children);
    }
    if (!(key in newProps)) {
      dom.removeAttribute(key)
    }
    else if (newProps[key] !== value) {
      dom[key] = newProps[key]
    }
  })
  Object.keys(newProps).forEach(key => {
    if (!(key in oldProps)) {
      dom[key] = newProps[key]
    }
  })
  return newProps
};

const reconcile = (parentDom, currentElement, newElement, index) => {
  if (currentElement === null && newElement === null) {
    return null;
  }

  if (currentElement === null) {
    if (typeof newElement === "string" || typeof newElement === "number") {
      const dom = document.createTextNode(newElement);
      parentDom.appendChild(dom);
    } else {
      const dom = createDom(newElement);
      parentDom.appendChild(dom);
    }
    return newElement
  }

  const currentDom = parentDom.childNodes[index];

  if (newElement === null) {
    parentDom.removeChild(currentDom);
    return newElement
  }

  if (
    (typeof currentElement === "string" ||
      typeof currentElement === "number") &&
    (typeof newElement === "string" ||
      typeof newElement === "number")
  ) {
    currentDom.textContent = newElement;
    return newElement
  }

  if (currentElement.type !== newElement.type) {
    const dom = createDom(newElement);
    parentDom.replaceChild(dom, currentDom);
    return newElement
  }

  updateProps(createDom, currentElement.props, newElement.props)

  return newElement
};

let currentElement = null;

const render = (element, container) => {
  if (typeof element.type === "function") {
    element = element.type(element.props);
    return render(element, container);
  }

  currentElement = reconcile(container, currentElement, element);
};

function Welcome() {
  return createElement("h1", null, "welcome");
}

function App() {
  console.log("App executed");

  return createElement(
    "div",
    null,
    createElement(Welcome, null),
    createElement("p", null, "hello"),
  );
}

const react = document.getElementById("react");

render(createElement(App, null), react);
