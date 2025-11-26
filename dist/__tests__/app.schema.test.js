import { describe, expect, it } from "vitest";
import { assetSchema, layoutSchema, projectConfigSchema, ragRequestSchema, ragResponseSchema, screenTemplateSchema } from "../domain/app.schema.js";
const sampleProject = {
    projectId: "eva-da",
    name: "EVA Domain Assistant",
    description: "DA workspace",
    theme: {
        primaryColor: "#0050b3",
        backgroundColor: "#f4f6fb",
        headerTextColor: "#111111"
    },
    i18n: {
        headlineKeyEn: "eva.da.headline",
        headlineKeyFr: "eva.da.headline.fr",
        subtitleKeyEn: "eva.da.subtitle",
        subtitleKeyFr: "eva.da.subtitle.fr"
    },
    api: {
        ragEndpoint: "https://api.example.com/rag",
        safetyProfile: "standard"
    }
};
const sampleLayout = {
    pageId: "dashboard",
    version: "1.0",
    sections: [
        { id: "hero", type: "hero", props: { headlineKey: "eva.da.headline" } },
        { id: "widgets", type: "grid", props: { columns: 2 } }
    ]
};
describe("app schemas", () => {
    it("validates project configs", () => {
        expect(projectConfigSchema.parse(sampleProject).projectId).toBe("eva-da");
    });
    it("rejects bad endpoints", () => {
        expect(() => projectConfigSchema.parse({
            ...sampleProject,
            api: { ...sampleProject.api, ragEndpoint: "not-a-url" }
        })).toThrowError();
    });
    it("validates layouts, templates, and assets", () => {
        expect(layoutSchema.parse(sampleLayout).sections).toHaveLength(2);
        expect(screenTemplateSchema.parse({
            templateId: "basic",
            label: "Basic template",
            layoutRef: "dashboard",
            allowedProjects: ["eva-da"],
            editableProps: ["headlineKey"]
        }).templateId).toBe("basic");
        expect(assetSchema.parse({ assetId: "hero", type: "svg", path: "/assets/hero.svg" }).type).toBe("svg");
    });
    it("validates rag payloads", () => {
        const req = ragRequestSchema.parse({ question: "What is CPP-D?", projectId: "eva-da" });
        expect(req.question).toContain("CPP-D");
        const resp = ragResponseSchema.parse({ answer: { text: "A disability program" } });
        expect(resp.answer.text).toContain("disability");
    });
});
//# sourceMappingURL=app.schema.test.js.map