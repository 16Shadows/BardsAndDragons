import { useState } from "react";

interface ListGroupProps {
  items: string[];
  heading: string;
  //func (item: string) => void
  onSelectItem: (utem: string) => void;
}

function ListGroup({ items, heading, onSelectItem }: ListGroupProps) {
  //   Hook
  const [selectedIndex, setSelectedIndex] = useState(-1);
  //   arr[0] // variable (selectedIndex)
  //   arr[1] // updater function

  const getMessage = () => {
    //return items.length === 0 ? <p>No items found</p>: null
    return items.length === 0 && <p>No items found</p>;
  };

  const handleClick = (event: MouseEvent) => console.log(event);

  return (
    <>
      <h1>{heading}</h1>
      {getMessage()}
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={item}
            onClick={() => {
              setSelectedIndex(index);
              onSelectItem(item);
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}
export default ListGroup;
