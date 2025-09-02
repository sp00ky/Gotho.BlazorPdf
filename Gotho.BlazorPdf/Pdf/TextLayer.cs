namespace Gotho.BlazorPdf.Pdf;

public class TextLayer
{
    public bool Enabled { get; private set; } = false;

    public string TextColor { get; private set; } = "#000000";
    public int FontSize { get; private set; } = 16;

    public void Toggle()
    {
        Enabled = !Enabled;
    }

    public void UpdateColor(string color)
    {
        TextColor = color;
    }

    public void UpdateFontSize(int size)
    {
        FontSize = size;
    }
}
