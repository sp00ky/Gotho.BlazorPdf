namespace Gotho.BlazorPdf.Pdf;

public class TextLayer
{
    public bool Enabled { get; private set; } = false;

    public string TextColor { get; private set; } = "#000000";
    public string Font { get; private set; } = "16px sans-serif";

    public void Toggle()
    {
        Enabled = !Enabled;
    }

    public void UpdateColor(string color)
    {
        TextColor = color;
    }

    public void UpdateFont(string font)
    {
        Font = font;
    }
}
