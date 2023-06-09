import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { preview } from "../assets";
import { getRandomPrompt } from "../utils";
import { FormField, Loader } from "../components";
import { CardType } from "../components/Card";
import { selectUser, selectUsername } from "../store/Reducers/authSlice";
import { useAppSelector } from "../store";
import { blobToBase64 } from "../utils";

const CreatePost = () => {
  enum AIModel {
    OpenAI = "OPENAI",
    SD = "SD",
  }

  const navigate = useNavigate();
  const sizeOptions = [256, 512, 1024];
  const numImageOptions = [1, 2, 3, 4];
  const username = useAppSelector(selectUsername);

  const [form, setForm] = useState<CardType>({
    _id: "",
    name: username,
    prompt: "",
    photo: "",
    photo_id: "",
    guidance_scale: undefined,
    size: 512,
    steps: undefined,
    numImages: 1,
    model: "",
  });

  const [generatingImg, setGeneratingImg] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<AIModel>(AIModel.SD);
  const [size, setSize] = useState<number>(512);
  const [numImages, setNumImages] = useState<number>(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  const generateImage = async (e: React.BaseSyntheticEvent) => {
    let url = "";
    let body = {};
    if (model === AIModel.OpenAI) {
      url = import.meta.env.VITE_API_URL + "/api/v1/dalle";
      body = {
        prompt: form.prompt,
        // n: form.numImages,
      };
    } else {
      url =
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";
      body = {
        inputs: form.prompt,
        // guidance_scale: form.guidance_scale,
        // steps: form.steps,
        // seed: -1,
      };
    }
    if (form.prompt) {
      try {
        setGeneratingImg(true);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: import.meta.env.VITE_HUGGINGFACE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data =
          model == AIModel.OpenAI
            ? await response.json()
            : await response.blob();
        const img =
          model == AIModel.OpenAI
            ? `data:image/jpeg;base64,${data.photo}`
            : await blobToBase64(data);
        setForm({ ...form, photo: img });
        handleSubmit({ ...form, photo: img, model: model });
      } catch (err) {
        alert(err);
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert("Please provide proper prompt");
    }
  };

  const handleSubmit = async (_form: CardType) => {
    if (_form.prompt && _form.photo) {
      setLoading(true);
      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + "/api/v1/post",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ..._form }),
          }
        );

        await response.json();
        alert("Success");
        navigate("/");
      } catch (err) {
        alert(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="flex justify-center mx-auto">
      <form className="mt-16">
        <div className="flex flex-col gap-5">
          {/* <FormField
            labelName="Your Name"
            type="text"
            name="name"
            value={username}
            handleChange={handleChange}
          /> */}
          <select
            className="flex flex-col gap-5"
            name="selectModel"
            value={model}
            onChange={(e) => setModel(e.target.value as AIModel)}
          >
            {(Object.keys(AIModel) as Array<keyof typeof AIModel>).map((m) => (
              <option value={AIModel[m]}>{m}</option>
            ))}
          </select>
          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="An Impressionist oil painting of sunflowers in a purple vase…"
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe
            handleSurpriseMe={handleSurpriseMe}
          />
          {/* <div className="flex flex-row gap-5 mb-2 justify-between">
            <div className="flex flex-row gap-5 mb-2">
              <label
                htmlFor="size"
                className="block text-sm font-medium text-gray-900"
              >
                Size
              </label>
              <select
                name="size"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                {sizeOptions.map((size) => (
                  <option value={size}>
                    {size}x{size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-row gap-5 mb-2">
              <label
                htmlFor="numImages"
                className="block text-sm font-medium text-gray-900"
              >
                Number Of Images
              </label>
              <select
                name="numImages"
                value={numImages}
                onChange={(e) => setNumImages(Number(e.target.value))}
              >
                {numImageOptions.map((num) => (
                  <option value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div> */}
          {/* {model == AIModel.SD ? (
            <div>
              <FormField
                labelName="Guidance Scale"
                type="range"
                name="guidance_scale"
                value={form.guidance_scale}
                handleChange={handleChange}
              />
              <FormField
                labelName="Guidance Scale"
                type="text"
                name="guidance_scale"
                value={form.guidance_scale}
                handleChange={handleChange}
              />
              <FormField
                labelName="Steps"
                type="range"
                name="steps"
                value={form.steps}
                handleChange={handleChange}
              />
              <FormField
                labelName="Steps"
                type="text"
                name="steps"
                value={form.steps}
                handleChange={handleChange}
              />
            </div>
          ) : (
            <></>
          )} */}
          <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
            {form.photo ? (
              <img
                src={form.photo}
                alt={form.prompt}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-9/12 h-9/12 object-contain opacity-40"
              />
            )}

            {generatingImg && (
              <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                <Loader />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-5">
          <button
            type="button"
            onClick={generateImage}
            className="dark:text-white bg-green-600 hover:bg-green-700"
          >
            {generatingImg ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;
