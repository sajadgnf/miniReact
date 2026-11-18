const createElement = (type, props, ...children) => {
  return { type, props: { ...props, children } }
}

const createDom = (element) => {
  if (typeof element === "string" || typeof element === "number") {
    return document.createTextNode(element);
  }

  if (typeof element.type === "function") {
    return createDom(element.type(element.props), react);
  }
  const dom = document.createElement(element.type);

  Object.entries(element.props).forEach(([key, value]) => {
    if (key === "children") value.forEach((child) => dom.appendChild(createDom(child)))
    else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      dom.addEventListener(eventName, value);
    }
    else dom[key] = value
  })

  return dom;
};

const reconcile = (parentDom, currentElement, newElement) => {

}

const render = (element, container) => {
  if (typeof element.type === "function") {
    element = element.type(element.props)
    return render(element, container)
  }
  const dom = createDom(element)
  container.appendChild(dom)
}

function Welcome() {
  return createElement('h1', null, 'welcome')
}

function App() {
  console.log("App executed");

  return createElement("div", null, createElement(Welcome, null), createElement("p", null, 'hello'));
}

const react = document.getElementById("react")

render(createElement(App, null), react)

