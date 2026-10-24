import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cardImage, searchCards, type Card } from "../game/cards";
import { ElixirDrop } from "./ElixirDrop";

interface Props {
  exclude: ReadonlySet<string>;
  onGuess: (key: string) => void;
}

/** Search box with card suggestions. Only real card names can be submitted. */
export function GuessInput({ exclude, onGuess }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => searchCards(query, exclude).slice(0, 8), [query, exclude]);
  const showList = open && results.length > 0;

  const pick = (card: Card) => {
    onGuess(card.key);
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="guess">
      <input
        ref={inputRef}
        className="guess__input"
        type="text"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        placeholder="Type a card name…"
        aria-label="Guess a card"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul className="guess__list" id={listId} role="listbox">
          {results.map((card, i) => (
            <li
              key={card.key}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`guess__option${i === active ? " is-active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(card)}
            >
              <img src={cardImage(card.key)} alt="" loading="lazy" />
              <span className="guess__name">{card.name}</span>
              <ElixirDrop value={card.elixir} size={18} />
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && results.length === 0 && <p className="guess__empty">No card matches “{query.trim()}”</p>}
    </div>
  );
}
