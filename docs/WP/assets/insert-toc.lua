function Header(el)
    if el.level == 1 and el.content[1].text == "Вторая глава" then
        return { pandoc.RawBlock("latex", "\\tableofcontents"), el }
    end
    return el
end
