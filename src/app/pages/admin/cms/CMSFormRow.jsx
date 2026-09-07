import { cmsStyles } from "./styles";

export default function CMSFormRow({ children }) {
  return (
    <div
      style={cmsStyles.formRow}
      onSubmit={(e) => e.preventDefault()}   // ⭐ prevents accidental navigation
      onClick={(e) => {
        // ⭐ Prevent clicks inside the row from bubbling up to a parent <form>
        if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") {
          e.stopPropagation();
        }
      }}
    >
      {children}
    </div>
  );
}
