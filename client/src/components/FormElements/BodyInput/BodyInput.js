import React, { useContext, useEffect, useRef, useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { BiLink, BiSolidQuoteAltLeft } from "react-icons/bi";
import { LuBold, LuItalic } from "react-icons/lu";
import { BsCodeSlash, BsCodeSquare, BsImage } from "react-icons/bs";
import { AiOutlineOrderedList, AiOutlineUnorderedList } from "react-icons/ai";
import useHttpClient from "../../../hooks/useHttpClient";
import { AuthContext } from "../../../context/auth";

export const BodyInput = (props) => {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const auth = useContext(AuthContext);
  const { sendReq } = useHttpClient();
  const { currentUser } = auth;

  const valueRef = useRef();
  valueRef.current = { value, isValid };

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const onChange = (value) => {
    setValue(value);
    if (valueRef.current.value !== "") {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
    props.onChange("body", value, valueRef.current.isValid);
  };

  const customMark = {
    bold: {
      ...commands.bold,
      icon: <LuBold size={22} />,
    },
    italic: {
      ...commands.italic,
      icon: <LuItalic size={22} />,
    },
    link: {
      ...commands.link,
      icon: <BiLink size={22} />,
    },
    code: {
      ...commands.code,
      icon: <BsCodeSlash size={22} />,
    },
    codeBlock: {
      ...commands.codeBlock,
      icon: <BsCodeSquare size={22} />,
    },
    orderedListCommand: {
      ...commands.orderedListCommand,
      icon: <AiOutlineOrderedList size={23} />,
    },
    unorderedListCommand: {
      ...commands.unorderedListCommand,
      icon: <AiOutlineUnorderedList size={23} />,
    },
    quote: {
      ...commands.quote,
      icon: <BiSolidQuoteAltLeft size={22} />,
    },
    image: {
      ...commands.image,
      execute: async (state, api) => {
        let modifyText = "";
        if (state.selectedText) {
          modifyText = `![image](${state.selectedText})\n`;
        }
        api.replaceSelection(modifyText);
      },

      icon: (
        <span>
          <label htmlFor="upload-image">
            <BsImage size={22} />
          </label>
          <input
            type="file"
            accept="image/*"
            id="upload-image"
            onChange={async (e) => {
              let img = e.target.files[0];
              if (img) {
                const formData = new FormData();
                formData.append("image", img);
                const res = await sendReq(
                  `${process.env.REACT_APP_BASE_URL}/upload-image`,
                  "POST",
                  formData,
                  {
                    Authorization: `Bearer ${currentUser.token.accessToken}`,
                  }
                );

                const modifyText = `![image](${res.secure_url})\n`;
                props.onChange(
                  "body",
                  `${valueRef.current.value} \n ${modifyText}`,
                  true
                );
              }
            }}
            style={{ display: "none" }}
          />
        </span>
      ),
    },
  };

  return (
    <MDEditor
      value={value}
      onChange={onChange}
      preview="edit"
      height={400}
      textareaProps={{
        placeholder: "Please your content here...",
      }}
      commands={[
        customMark.bold,
        customMark.italic,
        customMark.link,
        customMark.quote,
        customMark.orderedListCommand,
        customMark.unorderedListCommand,
        customMark.code,
        customMark.codeBlock,
        customMark.image,
      ]}
    />
  );
};
